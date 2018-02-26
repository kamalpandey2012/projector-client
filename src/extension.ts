'use strict';
import { ExtensionContext, Disposable, commands, window, workspace, Position, Selection } from 'vscode';
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
            console.log('file open', currentEditorPath);
            workspace.openTextDocument(currentEditorPath).then(function (didOpen) {
                window.showTextDocument(didOpen.uri).then(function (openFile) {
                    let editor = window.activeTextEditor;
                    if (!editor) {
                        return;
                    }
                    const position = new Position(1, 4);
                    editor.selections = [new Selection(position, position)];
                    console.log('editor opened', openFile);

                });
                console.log('file opened', didOpen);
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
            editor.selections = [new Selection(positionAnchor, positionActive)];
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}