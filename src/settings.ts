// get vscode extension options
import * as vscode from 'vscode';

export function getOptions(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('vscount');
}

export function setOptions(options: vscode.WorkspaceConfiguration): void {
    vscode.workspace.getConfiguration('vscount').update('files', options, true);
}
