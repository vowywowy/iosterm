'use strict';
//electron
const electron = require('electron');
const { app, BrowserWindow } = electron;
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
			if(settings.wasMax){
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

			win.on('close', ()=>{
				settings = {
					bounds: win.isMaximized() ? settings.bounds: win.getBounds(),
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
//end of electron
