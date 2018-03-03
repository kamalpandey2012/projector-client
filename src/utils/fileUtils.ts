import { Uri, workspace } from "vscode"; 

export const getFullFilePath = (filePath: string) => {
  if (!workspace) {
    return;
  }
  const root = workspace.workspaceFolders[0].uri.path;
  return root + filePath;
};