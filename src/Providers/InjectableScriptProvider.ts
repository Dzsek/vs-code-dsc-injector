import * as vscode from 'vscode';
import * as fs from 'fs';

export class InjectableScriptProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }

    if(!element){
      return vscode.workspace.findFiles('**/*.lua').then((results)=>{
        let files: ScriptFile[] = []
        
        results.sort();

        for(let file of results){
          const fc = fs.readFileSync(file.fsPath);
          const contents = fc.toString();
          const start = contents.indexOf('--#inject')
          const end = contents.indexOf('--#end')
          if(start>=0 && end>=0 && start < end)
          {
            files.push(new ScriptFile(file, this.workspaceRoot));
          }
        }
        

        return Promise.resolve(files);
      });
    }
    else
    {
      const sf = element as ScriptFile;
      const fc = fs.readFileSync(sf.uri.fsPath);
      const contents = fc.toString();

      let scripts:Injectable[] = [];
      console.log(contents);

      const regex = /^--#inject:([a-zA-Z0-9]*)$(.*?)^--#end$/gms;
      let matches = contents.matchAll(regex);
      
      for(const match of matches){
        scripts.push(new Injectable(match[1], match[2], match.index, sf.uri))
      }
      
      return Promise.resolve(scripts);
    }
  }

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class ScriptFile extends vscode.TreeItem {
  constructor(
    public readonly uri: vscode.Uri,
    public readonly root: string,
  ) {
    const label = uri.path.replace(root.replace(/\\/g,'/'), '').substring(2)

    super(label, vscode.TreeItemCollapsibleState.Collapsed);

    this.uri = uri;
    this.tooltip = label;
    this.description = label;
    this.iconPath = new vscode.ThemeIcon('folder');
    this.command = {
      "title": "Open File",
      "command": "dcs-lua-injector.openScript",
      "arguments": [ this.uri ]
    }
  }
}

class Injectable extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly index: number | undefined,
    public readonly uri: vscode.Uri,
  ) {
    super(name, vscode.TreeItemCollapsibleState.None);
    
    this.index = index
    this.code = code;
    this.tooltip = code;
    this.description = name;
    this.iconPath = new vscode.ThemeIcon('symbol-function');
    this.contextValue = 'injectable';
    this.command = {
      "title": "Open File at position",
      "command": "dcs-lua-injector.openScriptAtPosition",
      "arguments": [ this.index, this.uri]
    }
  }
}