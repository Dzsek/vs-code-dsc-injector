"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectableScriptProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
class InjectableScriptProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            return Promise.resolve([]);
        }
        if (!element) {
            return vscode.workspace.findFiles('**/*.lua').then((results) => {
                let files = [];
                results.sort();
                for (let file of results) {
                    const fc = fs.readFileSync(file.fsPath);
                    const contents = fc.toString();
                    const start = contents.indexOf('--#inject');
                    const end = contents.indexOf('--#end');
                    if (start >= 0 && end >= 0 && start < end) {
                        files.push(new ScriptFile(file, this.workspaceRoot));
                    }
                }
                return Promise.resolve(files);
            });
        }
        else {
            const sf = element;
            const fc = fs.readFileSync(sf.uri.fsPath);
            const contents = fc.toString();
            let scripts = [];
            console.log(contents);
            const regex = /^--#inject:([a-zA-Z0-9]*)$(.*?)^--#end$/gms;
            let matches = contents.matchAll(regex);
            for (const match of matches) {
                scripts.push(new Injectable(match[1], match[2], match.index, sf.uri));
            }
            return Promise.resolve(scripts);
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.InjectableScriptProvider = InjectableScriptProvider;
class ScriptFile extends vscode.TreeItem {
    constructor(uri, root) {
        const label = uri.path.replace(root.replace(/\\/g, '/'), '').substring(2);
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.uri = uri;
        this.root = root;
        this.uri = uri;
        this.tooltip = label;
        this.description = label;
        this.iconPath = new vscode.ThemeIcon('folder');
        this.command = {
            "title": "Open File",
            "command": "dcs-lua-injector.openScript",
            "arguments": [this.uri]
        };
    }
}
class Injectable extends vscode.TreeItem {
    constructor(name, code, index, uri) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.name = name;
        this.code = code;
        this.index = index;
        this.uri = uri;
        this.index = index;
        this.code = code;
        this.tooltip = code;
        this.description = name;
        this.iconPath = new vscode.ThemeIcon('symbol-function');
        this.contextValue = 'injectable';
        this.command = {
            "title": "Open File at position",
            "command": "dcs-lua-injector.openScriptAtPosition",
            "arguments": [this.index, this.uri]
        };
    }
}
//# sourceMappingURL=InjectableScriptProvider.js.map