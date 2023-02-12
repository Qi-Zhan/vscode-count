import * as vscode from 'vscode';
import {SourceFiles} from './file';

export function activate(context: vscode.ExtensionContext) {

	const provider = new StatWebViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(StatWebViewProvider.viewType, provider)
	);

	context.subscriptions.push(vscode.commands.registerCommand('vscount.refresh', () => {
		vscode.window.showInformationMessage('refresh from vscount!');
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showInformationMessage('Please open a workspace to count lines.');
			return;
		}
		provider.refresh();
	}));


}

export function deactivate() {}

class StatWebViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'vscount.StatView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri
	) {}

	resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};
		this._getHtmlForWebview(webviewView.webview).then(html => {
			webviewView.webview.html = html;
			// console.log(html);
			}
		);
	}

	public async refresh(): Promise<void> {
		await SourceFiles.fromWorkspace().then((files) => {
			if (this._view) {
				this._view.show?.(true);
				let tablevalue = files.stat2html();
				console.log(tablevalue);
				this._view.webview.postMessage({ command: 'refresh', tablevalue: tablevalue });
			}
		});
	}

	private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'table.css'));
		return await SourceFiles.fromWorkspace().then((files) => {
			let tablevalue = files.stat2html();
			return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet" />
				<title>Statistics</title>
	
			</head>
	
			<body>
			<table id="fileLinesTable">
			  <thead>
				<tr>
				  <th>Source File</th>
				  <th>Total Lines</th>
				  <th>Source Code Lines</th>
				  <th>Comment Lines</th>
				  <th>Blank Lines</th>
				</tr>
			  </thead>
			  <tbody id="fileLinesTableBody">
				${tablevalue}
			  </tbody>
			</table>
			<script src="${scriptUri}"></script>
		  </body>
		</html>`;
		});


	}
}
