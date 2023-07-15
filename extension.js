const vscode = require('vscode');
const net = require('net');



function activate(context) {

	let disposable = vscode.commands.registerCommand('dcs-lua-injector.run', async function () {
		var complete;
		var wait = new Promise((yes)=>{
			complete = yes
		});

		var client = new net.Socket();
		client.connect(18080, '127.0.0.1', async function() {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const document = editor.document;
				const selection = editor.selection;
				
				let toSend = document.getText(selection);
				if(!toSend)
				{
					toSend = document.getText();
				}

				const data = {
					"type":"lua",
					"script": toSend
				}
				
				client.write(JSON.stringify(data)+'\n');
				vscode.window.showInformationMessage('DCS Lua injector: Sending');
			}
			else
			{
				vscode.window.showInformationMessage('DCS Lua injector: Nothing to send');
			}

			client.on('data',(data)=>{
				data = JSON.parse(data)
				if(data.type == "receipt"){
					if(data.status == "OK"){
						vscode.window.showInformationMessage('DCS Lua injector: Sent');
					}
					else
					{
						vscode.window.showInformationMessage('DCS Lua injector: Error');
					}
					
					client.destroy()
					complete();
				}
			})
		});

		client.on('error', function() {
			vscode.window.showInformationMessage('DCS Lua injector: Can not connect');
		});

		await wait;
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
