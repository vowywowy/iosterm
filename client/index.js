'use strict';
//electron
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let win = null;
['ready', 'activate'].forEach((e) => {
	if (win === null) {
		app.on(e, () => {
			win = new BrowserWindow();
			win.loadURL(url.format({
				pathname: path.join(__dirname, 'index.html'),
				protocol: 'file:',
				slashes: true
			}));

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
//end of electron

