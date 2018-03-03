'use strict';
import { ExtensionContext, Disposable, commands, window, workspace, Position, Selection, Range, Uri, ShellExecution } from 'vscode';
import * as io from 'socket.io-client';
import { config } from './socketconfig';
import * as fs from 'fs';
import * as fileUtil from './utils/fileUtils';
import * as DocumentEvents from './eventHandler/DocumentEvents';

export function activate(context: ExtensionContext) {

    console.log('Congratulations, your extension "projector" is now active!');

    var disposable = commands.registerCommand('extension.joinProjector', () => {
        let rootPath = '';
        if (workspace.workspaceFolders) {
            rootPath = workspace.workspaceFolders[0].uri.path;
        }
        // The code you place here will be executed every time your command is executed
        const connectionUrl = `${config.url}:${config.port}`;
        // Display a message box to the user
        window.showInformationMessage('Initiating connection. Please wait...');
        const socket = io(connectionUrl);
        socket.on('connection', function () {
            console.log('connection established');
        });

        socket.on('file_system_change', function (data: string) {
            console.log('inside file system change');
            const fileSystemChangeData = JSON.parse(data);
            const changeType: string = fileSystemChangeData.action;
            const filePath = fileSystemChangeData.filePath;
            const fullPath: string | undefined = fileUtil.getFullFilePath(filePath);
            if (!fullPath) {
                return;
            }
            switch (changeType) {
                case 'create':
                    fs.open(fullPath, 'wx', function (err: any, fd: any) {
                        if (err) {
                            if (err.code === 'EEXIST') {
                                console.error('file already exists');
                                return;
                            }
                            return;
                        }
                        writeDataToFile(fd, rootPath, filePath);
                    });
                    break;
                case 'delete':
                    break;
                default:
                    console.log('no event catched', changeType);
            }
        });

        socket.on('load_file_to_editor', function (filePath: string) {
            DocumentEvents.load_file_to_editor(rootPath, filePath);
        });

        socket.on('selection_change', function (data: string) {
            const editor = window.activeTextEditor;
            if (!editor) {
                return;
            }
            const selectionData = JSON.parse(data);
            const positionAnchor = new Position(selectionData.anchor.line, selectionData.anchor.character);
            const positionActive = new Position(selectionData.active.line, selectionData.active.character);
            const range = new Range(positionAnchor, positionActive);
            editor.revealRange(range, 1);
            editor.selections = [new Selection(positionAnchor, positionActive)];
        });

        socket.on('change_document', function (data: string) {
            const editor = window.activeTextEditor;
            if (!editor) {
                return;
            }
            editor.edit(function (editBuilder) {
                const editOptions = JSON.parse(data);
                const mode = editOptions.mode;
                const pos1 = editOptions.position1;
                const pos2 = editOptions.position2;
                const text = editOptions.text;
                const position1 = new Position(pos1.line, pos1.character);
                if (mode === 1) {
                    editBuilder.insert(position1, text);
                }
                else if (mode === 2) {
                    const position2 = new Position(pos2.line, pos2.character);
                    const deleteRange = new Range(position1, position2);
                    editBuilder.delete(deleteRange);
                }
                // editor.preserveFocus()

            });
        });

    });
    context.subscriptions.push(disposable);

    const writeDataToFile = (fd: number, rootPath: string, filePath: string) => {

        fs.write(fd, ``, function (err, written: number, data: string) {
            if (err) {
                console.log('something went wrong');
                return;
            }
            console.log('file written', written, data);
            DocumentEvents.load_file_to_editor(rootPath, filePath);
            console.log('file opened');
        });
    };
}


export function deactivate() {
}