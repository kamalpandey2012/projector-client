import { workspace, window } from 'vscode';

export const load_file_to_editor = (rootPath: string, filePath: string) => {
  const currentEditorPath = rootPath + filePath;
  workspace.openTextDocument(currentEditorPath).then(function (didOpen) {
    window.showTextDocument(didOpen.uri).then(function (openFile) {
      let editor = window.activeTextEditor;
      if (!editor) {
        return;
      }
    });
  });
}