
import express from 'express';
import body_parser from 'body-parser';

const app = express.createServer(express.logger()),
const io = require('socket.io').listen(app),

// const app = express();
// const http = require('http').Server(app);
// const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');
const request = require('request');
const port = process.env.PORT || 4000;

import {
	CONNECTION,
	JOIN,
	LEAVE,
	JOINED,
	LEFT,
	MESSAGE,
	SERVER_URL
} from './src/constant';

//app use
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use(cors());

app.listen(port, () => {
	console.log('listening on :', port);
});

app.get('/', (req, res) => {
	res.json({ message: 'jai' })
})

io.sockets.on(CONNECTION, (socket) => {

	io.sockets.on(JOIN, (room_name) => {
		//if player is already added then remove
		socket.join(room_name);
		io.sockets.emit(JOINED, "Joined");
	});

	io.sockets.on(LEAVE, (room_name) => {
		//if player is added then remove.
		socket.leave(room_name);
		io.sockets.emit(LEFT, "Left");
	});

	io.sockets.on(MESSAGE, (message) => {
		if (message.toLowerCase().includes('welcome')) {
			io.sockets.emit(MESSAGE, { text: message });
			return;
		}
		var options = {
			method: 'POST',
			url: SERVER_URL,
			headers:
			{
				'accept': 'application/json',
				'content-type': 'application/json'
			},
			body:
			{
				text: message
			},
			json: true
		};

		request(options, (error, response, body) => {
			if (error) {
				io.sockets.emit(MESSAGE, { text: 'Something wrong. I answer python questions' });
			} else if (body) {
				io.sockets.emit(MESSAGE, body.message);
			}
		});
		//io.emit(MESSAGE, { text: 'Hang on!! getting you there. Im not that cool, I need some time.\n\n\n Processing....' });

	});
});