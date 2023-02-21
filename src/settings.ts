// get vscode extension options
import * as vscode from 'vscode';

export function getLanguageExtension(): Set<string> {

    const config = vscode.workspace.getConfiguration('vscount');
    const customSetting = config.get<string>('language');
    if (customSetting === undefined) {
        return new Set();
    }
    let rs = customSetting.split(",");
    rs = rs.map((s) => s.trim());
    return new Set(rs);
}

