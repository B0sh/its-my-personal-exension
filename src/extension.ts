import * as vscode from 'vscode';

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('decorator sample is activated');

	let timeout: NodeJS.Timer | undefined = undefined;

	// create a decorator type that we use to decorate large numbers
	const thisWarningDecorationType = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		// use a themable color. See package.json for the declaration and default values.
		backgroundColor: { id: 'myextension.thisWarningBackground' }
	});

	let activeEditor = vscode.window.activeTextEditor;

	function updateDecorations() {
		if (!activeEditor) {
			return;
		}

		const specTsExtension = /.*\.spec\.ts/g;
		if (specTsExtension.exec(activeEditor.document.fileName)) {
			const regEx = /this\./g;
			const text = activeEditor.document.getText();
			const thisInJestFiles: vscode.DecorationOptions[] = [];
			let match;
			while (match = regEx.exec(text)) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Hey, dont use this in a spec file idiot' };
				thisInJestFiles.push(decoration);
			}
			activeEditor.setDecorations(thisWarningDecorationType, thisInJestFiles);
		}

		const ahkExtension = /.*\.ahk/g;
		if (ahkExtension.exec(activeEditor.document.fileName)) {
			const regEx = /^(?!\s*(if|while)).*[^:]=.*$/gmi;
			const text = activeEditor.document.getText();
			const thisInJestFiles: vscode.DecorationOptions[] = [];
			let match;
			while (match = regEx.exec(text)) {
				const startPos = activeEditor.document.positionAt(match.index);
				const endPos = activeEditor.document.positionAt(match.index + match[0].length);
				const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Use the expression syntax (:=) when making variable!' };
				thisInJestFiles.push(decoration);
			}
			activeEditor.setDecorations(thisWarningDecorationType, thisInJestFiles);
		}
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

}

