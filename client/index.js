'use strict';
//electron
const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;
const path = require('path');
const url = require('url');
const fs = require('fs');

let win = null;
['ready', 'activate'].forEach((e) => {
	if (win === null) {
		app.on(e, () => {
			const settingsFile = 'client/settings/window.json';
			let settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
			win = new BrowserWindow(settings.bounds);
			if (settings.wasMax) {
				win.maximize();
			}

			win.once('ready-to-show', () => {
				win.show();
			});

			win.loadURL(url.format({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file:',
				slashes: true
			}));

			win.on('close', () => {
				settings = {
					bounds: win.isMaximized() ? settings.bounds : win.getBounds(),
					wasMax: win.isMaximized()
				};
				fs.writeFileSync(settingsFile, JSON.stringify(settings));
			});

			win.on('closed', () => {
				win = null;
			});

			//devtools
			win.webContents.openDevTools();
		});
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.commandLine.appendSwitch('--enable-overlay-scrollbar');

//menus
const template = [
	{
		label: 'Connect',
		submenu: [
			{ label: 'New Connection', accelerator: 'CmdOrCtrl+Shift+N' },
			{ label: 'Stop Connection', accelerator: 'CmdOrCtrl+Shift+~' },
			{ type: 'separator' },
			{ label: 'Saved Connections', submenu:[
				{ label: 'Saved connections go here...'}
			]},
			{ label: 'Edit Saved Connections', submenu: [
				{ label: 'Saved connections go here...' }
			]}
		]
	},
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'pasteandmatchstyle' },
			{ role: 'delete' },
			{ role: 'selectall' }
		]
	},
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forcereload' },
			{ role: 'toggledevtools' },
			{ type: 'separator' },
			{ role: 'resetzoom' },
			{ role: 'zoomin' },
			{ role: 'zoomout' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	{
		role: 'window',
		submenu: [
			{ role: 'minimize' },
			{ role: 'close' }
		]
	},
	{
		role: 'help',
		submenu: [
			{
				label: 'Learn More',
				click() { require('electron').shell.openExternal('https://electron.atom.io') }
			}
		]
	}
]

if (process.platform === 'darwin') {
	template.unshift({
		label: app.getName(),
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services', submenu: [] },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideothers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	})

	// Edit menu
	template[1].submenu.push(
		{ type: 'separator' },
		{
			label: 'Speech',
			submenu: [
				{ role: 'startspeaking' },
				{ role: 'stopspeaking' }
			]
		}
	)

	// Window menu
	template[3].submenu = [
		{ role: 'close' },
		{ role: 'minimize' },
		{ role: 'zoom' },
		{ type: 'separator' },
		{ role: 'front' }
	]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
//end of electron
