"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const net = require("net");
const InjectableScriptProvider_1 = require("./Providers/InjectableScriptProvider");
async function sendScript(code) {
    var resolveOut;
    var rejectOut;
    var wait = new Promise((resolve, reject) => {
        resolveOut = resolve;
        rejectOut = reject;
    });
    var client = new net.Socket();
    client.connect(18080, '127.0.0.1', async function () {
        const data = {
            "type": "lua",
            "script": code
        };
        client.write(JSON.stringify(data) + '\n');
        client.on('data', (recieved) => {
            let data = JSON.parse(recieved);
            if (data.type == "receipt") {
                client.destroy();
                if (data.status == "OK") {
                    resolveOut("Sent");
                }
                else {
                    rejectOut("DCS returned an error");
                }
            }
        });
    });
    client.on('error', function () {
        rejectOut("Connection error");
        client.destroy();
    });
    return await wait;
}
function activate(context) {
    vscode.commands.registerCommand('dcs-lua-injector.runSelection', async function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            let toSend = document.getText(selection);
            if (!toSend) {
                toSend = document.getText();
            }
            vscode.window.showInformationMessage('DCS Lua injector: Sending');
            await sendScript(toSend).then(() => {
                vscode.window.showInformationMessage('DCS Lua injector: Sent');
            }).catch((reason) => {
                vscode.window.showInformationMessage('DCS Lua injector: ' + reason);
            });
        }
        else {
            vscode.window.showInformationMessage('DCS Lua injector: Nothing to send');
        }
    });
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
    const injectableScriptProvider = new InjectableScriptProvider_1.InjectableScriptProvider(rootPath);
    vscode.window.createTreeView('dcs-injector-scripts-list', { treeDataProvider: injectableScriptProvider });
    vscode.commands.registerCommand('dcs-lua-injector.refreshScriptsList', () => injectableScriptProvider.refresh());
    vscode.commands.registerCommand('dcs-lua-injector.executeScript', async function (injectable) {
        vscode.window.showInformationMessage('DCS Lua injector: Sending');
        await sendScript(injectable.code).then(() => {
            vscode.window.showInformationMessage('DCS Lua injector: Sent');
        }).catch((reason) => {
            vscode.window.showInformationMessage('DCS Lua injector: ' + reason);
        });
    });
    vscode.commands.registerCommand('dcs-lua-injector.openScript', async function (uri) {
        await vscode.commands.executeCommand('vscode.open', uri);
    });
    vscode.commands.registerCommand('dcs-lua-injector.openScriptAtPosition', async function (index, uri) {
        await vscode.commands.executeCommand('vscode.open', uri).then(() => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const pos = document.positionAt(index);
                const start = new vscode.Position(pos.line, 0);
                const end = new vscode.Position(pos.line + 1, 0);
                const range = new vscode.Range(start, end);
                const selection = new vscode.Selection(start, end);
                editor.revealRange(range);
                editor.selection = selection;
            }
        });
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map