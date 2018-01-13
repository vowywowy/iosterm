'use strict';
document.addEventListener('DOMContentLoaded', () => {
	//client
	const net = require('net');
	const fs = require('fs');
	const { clipboard, ipcRenderer } = require('electron');
	ipcRenderer.send('ready', 'terminal');
	ipcRenderer.on('config', (ev, config)=>{
		console.log(config);
		document.title += `@${config.host}${config.port == 23 ? '' : ':' + config.port}`;
		let client = net.createConnection(config, () => {
			client.on('error', (er) => {
				console.log(er);
			});
		}).on('error', (er) => {
			console.log(er);
		});

		fs.readFile('client/terminal/res/characters.json', (e, d) => {
			//throw any file error
			if (e) throw e;
			const special = JSON.parse(d);
			const terminal = document.getElementById('terminal');
			const show = document.getElementById('show');
			const overwrite = document.getElementById('overwrite');

			window.addEventListener('click', () => {
				terminal.focus();
			});
			window.dispatchEvent(new Event('click'));

			terminal.addEventListener('keydown', (e) => {
				e.preventDefault();
				e.ctrlKey && e.shiftKey && e.key == 'V'
					? client.write(Buffer(clipboard.readText()))
					: e.ctrlKey && special.control.hasOwnProperty(e.key)
						? client.write(Buffer(special.control[e.key]))
						: special.send.hasOwnProperty(e.key)
							? client.write(Buffer(special.send[e.key]))
							: client.write(e.key);
				terminal.innerHTML = '';
				console.log(e.key);
			});
			//receiving data
			client.on('data', (d) => {
				d.find((char) => {
					d = Array.from(d);
					switch (char) {
						case 255: //telnet protocol commands
							d.splice(d.indexOf(char), 3);
							break;
						case 245: //Abort output (ctrl+shift+6)
							d.splice(d.indexOf(char), 1);
							show.textContent += 'Bye!';
						case 7: //BEL
							d.splice(d.indexOf(char), 1);
							new Audio('res/bell.ogg').play();
							break;
					}
				});
				//character handling
				d.forEach((char) => {
					switch (char) {
						case 8:
							//move the caret back 1 character
							overwrite.textContent = show.textContent.slice(-1) + overwrite.textContent;
							show.textContent = show.textContent.slice(0, -1);
							overwrite.textContent.charCodeAt(0) == 32
								? overwrite.classList.add('space')
								: overwrite.classList.remove('space');
							break;
						default:
							if (overwrite.textContent.length) {
								overwrite.textContent = overwrite.textContent.slice(1);
								overwrite.textContent.charCodeAt(0) == 32
									? overwrite.classList.add('space')
									: overwrite.classList.remove('space');
							}
							show.textContent += String.fromCharCode(char);
					}
				});
				console.log(d);
				document.body.scrollTop = document.body.scrollHeight;
			});

			//auto copy
			document.addEventListener('mouseup', (e) => {
				if (e.which == 1) { //lmb
					const sel = (document.all)
						? document.createRange().text
						: document.getSelection();
					const board = document.getElementById('board');
					board.value = sel;
					if (board.value.length) {
						board.select();
						document.execCommand('copy');

						const container = document.getElementById('container');
						container.getAttribute('class') ? (
							container.classList.remove('fadeout'),
							void container.offsetWidth,
							container.classList.add('fadeout')
						) : container.classList.add('fadeout');
					}
				} else if (e.which == 3) { //rmb
					client.write(Buffer(clipboard.readText()));
					terminal.focus();
				}
			});
		});
	});

	const config = {
		//required
		port: 23,
		host: '192.168.2.2',
		//optional
		/*
		localAddress: '',
		localPort: '',
		family: 4,
		hints: 0,
		lookup: dns.lookup
		*/
	};
	
});