import * as vscode from 'vscode';
import * as os from 'os';
   

class File {
    path: string;
    content: string;
    name: string;
    constructor(name: string, path: string, content: string) {
        this.name =  name;
        this.path =  path;
        this.content =  content;
    }

    countlines(): number {
        // get current system line separator
        let lineSeparator = os.EOL;
        let lines = this.content.split(lineSeparator);
        return lines.length;
    }
    
    public static async fromUri(uri: vscode.Uri): Promise<File> {
        return await vscode.workspace.openTextDocument(uri).then((doc) => {
            let content = doc.getText();
            let name = uri.fsPath.split("/").pop();
            name = name ? name : "";
            return new File(name, uri.fsPath, content); 
        });
    }


}

export class Files {
    files: File[];
    constructor(files: File[]) {
        this.files = files;
    }

    static async fromUriArray(uris: vscode.Uri[]): Promise<File[]> {
        
        let files: File[] = [];
        await Promise.all(uris.map(async (uri) => {
            
            await File.fromUri(uri).then((file) => {
                files.push(file);
            });
        }));
        return files;
    }

    public static async fromWorkspace(): Promise<Files> {
        return await vscode.workspace.findFiles("**/**").then(async (value) => {
            // filter value to get only files ending with .py
            value = value.filter((uri) => {
                return uri.fsPath.endsWith(".py");
            });
            let files = await Files.fromUriArray(value);
            return new Files(files);
        });
    }

    // count every file in workspace and return an array of tuple (file, count)
    public count(): [File, number][] {
        let countArray: [File, number][] = [];
        this.files.forEach((file) => {
            countArray.push([file, file.countlines()]);
        });
        return countArray;
    }
}

// file tree view
// class FileTreeView implements vscode.TreeDataProvider<File> {
//     private _onDidChangeTreeData: vscode.EventEmitter<File | undefined> = new vscode.EventEmitter<File | undefined>();
//     readonly onDidChangeTreeData: vscode.Event<File | undefined> = this._onDidChangeTreeData.event;

//     refresh(): void {
//         this._onDidChangeTreeData.fire();
//     }

//     getTreeItem(element: File): vscode.TreeItem {
//         return element;
//     }

//     getChildren(element?: File): Thenable<File[]> {
//         return Promise.resolve(File.fromWorkspace());
//     }
// }

