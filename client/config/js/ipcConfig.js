'use strict';
document.addEventListener('DOMContentLoaded', () => {
	const { ipcRenderer, remote } = require('electron');
	document.getElementById('config').addEventListener('submit', (e) => {
		e.preventDefault();
		let config = {};
		//FORM COLLECTION
		document.querySelectorAll('form *[name]').forEach((e) => {
			console.log(e);
			if(e.type == 'radio' || e.type == 'checkbox'){
				if(e.checked){
					config[e.name] = e.value;
				}
			} else if(e.value) {
				config[e.name] = e.value;
			} else if(!e.value){
				switch (e.name){
					case 'host':
						config[e.name] = 'localhost';
						break;
					case 'port':
						config[e.name] = '23';
				}
			}	
		});
		ipcRenderer.send('config', config);
		remote.getCurrentWindow().close();
	});
});