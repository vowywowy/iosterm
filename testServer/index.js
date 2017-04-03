const net = require('net');

//simple telnet server
let server = net.createServer((socket) => {
	console.log('Connection from: ', socket.remoteAddress);
	socket.on('data', (d) => {
		socket.write(d);
		console.log(d);
	});
	socket.on('end', () => {
		console.log('Disconnection!')
	});
	socket.on('error', (er) => {
		console.log(er);
	});
}).on('error', (er) => {
	console.log(er);
}).listen(23);