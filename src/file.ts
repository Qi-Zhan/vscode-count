import * as vscode from 'vscode';
import * as os from 'os';
import * as setting from './settings';
import ignore from 'ignore';
import { Ignore } from 'ignore';
import { Utils } from 'vscode-uri';
import path = require('path');
import * as fs from 'fs';

class Stat {
    total: number;
    blank: number;
    comment: number;
    code: number;
    constructor(total: number, blank: number, comment: number, code: number) {
        this.total = total;
        this.blank = blank;
        this.comment = comment;
        this.code = code;
    }
}


class SourceFile {
    path: string;
    content: string;
    name: string;
    extension: string;
    constructor(name: string, path: string, content: string, extension: string) {
        this.name = name;
        this.path = path;
        this.content = content;
        this.extension = extension;
    }

    stat(): Stat {
        // get current system line separator
        let lineSeparator = os.EOL;
        let lines = this.content.split(lineSeparator);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            if (line.trim().length === 0) {
                blank++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }

    public static async fromUri(uri: vscode.Uri): Promise<SourceFile> {
        return await vscode.workspace.openTextDocument(uri).then((doc) => {
            let content = doc.getText();
            let name = uri.fsPath.split("/").pop();
            name = name ? name : "";
            let extension = uri.fsPath.split(".").pop();
            extension = extension ? extension : "";
            switch (extension) {
                case "py":
                    return new PythonFile(name, uri.fsPath, content);
                case "java":
                    return new JavaFile(name, uri.fsPath, content);
                case "js":
                    return new JsFile(name, uri.fsPath, content);
                case "ts":
                    return new TsFile(name, uri.fsPath, content);
                case "c":
                    return new CFile(name, uri.fsPath, content);
                case "rs":
                    return new RsFile(name, uri.fsPath, content);
                default:
                    return new SourceFile(name, uri.fsPath, content, extension);
            }
        });
    }
}


class PythonFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "py");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            if (line.trim().length === 0) {
                blank++;
            } else if (line.trim().startsWith("#")) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

class JavaFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "java");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            if (line.match(/^\s*$/)) {
                blank++;
            } else if (line.match(/^\s*\/\//)) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

class JsFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "js");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            // check if line is blank
            if (line.match(/^\s*$/)) {
                blank++;
            } else if (line.match(/^\s*\/\//)) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

class TsFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "ts");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            // check if line is blank
            if (line.match(/^\s*$/)) {
                blank++;
            } else if (line.match(/^\s*\/\//)) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

class RsFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "rs");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            // check if line is blank
            if (line.match(/^\s*$/)) {
                blank++;
            } else if (line.match(/^\s*\/\//)) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

class CFile extends SourceFile {
    constructor(name: string, path: string, content: string) {
        super(name, path, content, "c");
    }

    stat(): Stat {
        let lines = this.content.split(os.EOL);
        let total = lines.length;
        let blank = 0;
        let comment = 0;
        let code = 0;
        lines.forEach((line) => {
            // check if line is blank
            if (line.match(/^\s*$/)) {
                blank++;
            } else if (line.match(/^\s*\/\//)) {
                comment++;
            } else {
                code++;
            }
        }
        );
        return new Stat(total, blank, comment, code);
    }
}

export class SourceFiles {
    files: SourceFile[];
    constructor(files: SourceFile[]) {
        this.files = files;
    }

    static async fromUriArray(uris: vscode.Uri[]): Promise<SourceFile[]> {
        let files: SourceFile[] = [];
        await Promise.all(uris.map(async (uri) => {
            await SourceFile.fromUri(uri).then((file) => {
                files.push(file);
            });
        }));
        return files;
    }

    static async getIgnore(): Promise<Ignore> {
        let ig = ignore({allowRelativePaths: true});
        try {
            let folder = vscode.workspace.workspaceFolders;
            if (folder === undefined) {
                return ig;
            } else {
                if (folder.length === 0) {
                    return ig;
                }
                // if (vscode.workspace.asRelativePath())
                let ignorePath = Utils.joinPath(folder[0].uri, ".gitignore");
                if (!fs.existsSync(ignorePath.fsPath)) {
                    return ig;
                }
                return vscode.workspace.fs.readFile((Utils.joinPath(folder[0].uri, ".gitignore") )).then((data) => {
                    let content = data.toString();
                    const ignoreContent = content.split(os.EOL);
                    // console.log("---%s", ignoreContent);
                    return ig.add(ignoreContent);
                });
            }
        } catch (error) {
            return ig;
        }
    }

    public static async fromWorkspace(): Promise<SourceFiles> {
        return await SourceFiles.getIgnore().then(async (ig) => {
            return await vscode.workspace.findFiles("**/**").then(async (values) => {
                values = values.filter((uri) => {
                    // get acceptable extension from vscode setting
                    let extaccept = setting.getLanguageExtension();
                    let ext = uri.fsPath.split(".").pop();
                    // consider file with no extension as unacceptable
                    if (ext === undefined || !extaccept.has(ext)) {
                        return false;
                    }
                    let path = vscode.workspace.asRelativePath(uri.fsPath);
                    if (ig.ignores(path)) {
                        return false;
                    }
                    return true;
                });
                let files = await SourceFiles.fromUriArray(values);
                return new SourceFiles(files);
            });
        });
    }

    // count every file in workspace and return an array of tuple (file, count)
    public stat(): [SourceFile, Stat][] {
        let stats: [SourceFile, Stat][] = [];
        this.files.forEach((file) => {
            stats.push([file, file.stat()]);
        });
        // sort array by count
        stats.sort((a, b) => {
            return b[1].total - a[1].total;
        });
        // sum all counts based on blank, comment and code
        let sum = new Stat(0, 0, 0, 0);
        stats.forEach((value) => {
            sum.total += value[1].total;
            sum.blank += value[1].blank;
            sum.comment += value[1].comment;
            sum.code += value[1].code;
        });
        stats.push([new SourceFile("Total:", "", "", ""), sum]);

        return stats;
    }

    private chooseName(stats: [SourceFile, Stat][], file: SourceFile): string {
        // if i th element name is unique, return it
        if (stats.filter((value) => {
            return value[0].name === file.name;
        }
        ).length === 1) {
            return file.name;
        }
        // else return name + last part of path
        // console.log(file.path);
        let paths = file.path.split("/");
        if (paths.length === 1) {
            return file.name;
        } else {
            return file.name + " (" + paths[paths.length - 2] + ")";
        }
    }

    public stat2html(): string {
        let stat = this.stat();
        let html = "";
        stat.forEach((value) => {
            if (value[0].name === "Total:") {
                // html += `<tr><td><b>${this.chooseName(stat, value[0])}</b></td><td><b>${value[1].total}</b></td><td><b>${value[1].code}</b></td><td><b>${value[1].comment}</b></td><td><b>${value[1].blank}</b></td></tr>`;
                html += `<tr><td><b>Total ${this.files.length} Files</b></td><td><b>${value[1].total}</b></td><td><b>${value[1].code}</b></td><td><b>${value[1].comment}</b></td><td><b>${value[1].blank}</b></td></tr>`;
            } else {
                html += `<tr><td>${this.chooseName(stat, value[0])}</td><td>${value[1].total}</td><td>${value[1].code}</td><td>${value[1].comment}</td><td>${value[1].blank}</td></tr>`;
            }
        }
        );
        return html;
    }

}

