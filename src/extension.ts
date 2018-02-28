'use strict';
import { ExtensionContext, Disposable, commands, window, workspace, Position, Selection, Range, Uri, ShellExecution } from 'vscode';
import * as io from 'socket.io-client';
import { config } from './socketconfig';

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


        socket.on('update_time', function (data: any) {
        });


        socket.on('open_file', function (filePath: string) {
            const currentEditorPath = rootPath + filePath;
            workspace.openTextDocument(currentEditorPath).then(function (didOpen) {
                window.showTextDocument(didOpen.uri).then(function (openFile) {
                    let editor = window.activeTextEditor;
                    if (!editor) {
                        return;
                    }
                });
            });
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
        socket.on('file_system_change', function (data: string) {
            const fileSystemChangeData = JSON.parse(data);
            const changeType: string = fileSystemChangeData.action;
            const changeUri: Uri = fileSystemChangeData.uri;
            if (changeType === 'created') {
                // const newShellExecution = new ShellExecution(`touch ${}`);
            }
        });



        context.subscriptions.push(disposable);
    }

export function deactivate() {
    }