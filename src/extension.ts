import * as vscode from 'vscode';
import {Files} from './file';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('vscount.count', () => {
		let workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showInformationMessage('Please open a workspace to count lines.');
            return;
        }
		Files.fromWorkspace().then((files) => {
			if (files.files.length > 0) {
				let countResult = files.count();
				let countAll = 0;
				countResult.forEach((value) => {
					console.log(value[0].name, value[1]);
					countAll += value[1];
				});
				// show panel result in status bar
				vscode.window.setStatusBarMessage(`Number of lines in all Python files in this workspace: ${countAll}`, 5000);
						
					
				// show panel result in output
				let output = vscode.window.createOutputChannel('vscount');
				output.appendLine(`Number of lines in all Python files in this workspace: ${countAll}`);
				countResult.forEach((value) => {
					output.appendLine(`${value[0].name}: ${value[1]}`);
				});
				output.show();

			} else {
				console.log("No files found");
			}
		});
	});
	context.subscriptions.push(disposable);
}

export function deactivate() {}


// import * as vscode from 'vscode';
// import * as path from 'path';
// import * as fs from 'fs';

// export async function activate(context: vscode.ExtensionContext) {
//     let disposable = vscode.commands.registerCommand('vscount.count', async () => {
//         let count = 0;
//         let workspaceFolders = vscode.workspace.workspaceFolders;

//         if (!workspaceFolders) {
//             vscode.window.showInformationMessage('Please open a workspace to count lines.');
//             return;
//         }

//         for (const folder of workspaceFolders) {
//             count += await countLinesInFolder(folder.uri.fsPath);
//         }

//         vscode.window.showInformationMessage(`Number of lines in all Python files in this workspace: ${count}`);
//     });

//     context.subscriptions.push(disposable);
// }

// async function countLinesInFolder(folder: string): Promise<number> {
//     return new Promise<number>((resolve, reject) => {
//         fs.readdir(folder, async (err, files) => {
//             if (err) {
//                 console.error(err);
//                 reject(err);
//                 return;
//             }

//             let count = 0;
//             for (const file of files) {
//                 let fullPath = path.join(folder, file);
//                 let stat = await statAsync(fullPath);
//                 if (stat.isFile() && path.extname(file) === '.py') {
//                     let data = await readFileAsync(fullPath, 'utf8');
//                     count += data.split(/\r\n|\r|\n/).length;
//                 } else if (stat.isDirectory()) {
//                     count += await countLinesInFolder(fullPath);
//                 }
//             }

//             resolve(count);
//         });
//     });
// }

// function statAsync(path: string): Promise<fs.Stats> {
//     return new Promise<fs.Stats>((resolve, reject) => {
//         fs.stat(path, (err, stat) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(stat);
//             }
//         });
//     });
// }

// function readFileAsync(path: string, encoding:any): Promise<string> {
//     return new Promise<string>((resolve, reject) => {
// 		fs.readFile(path, encoding, (err, data) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(data.toString());
// 			}
// 		});
// 	});
// }
