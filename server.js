
const express = require('express');
const body_parser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');
const request = require('request');
const port = process.env.PORT || 4000;


 const SERVER_URL = 'https://finpe.eu-gb.mybluemix.net/process' //'http://192.168.12.225:5000/process' //''


 const CONNECTION = 'connection';
 const MESSAGE = 'message';
 const JOIN = 'join';
 const LEAVE = 'leave';
 const JOINED = 'joined';
 const LEFT = 'left';
 const ERROR = 'error';


//app use
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express.static(path.join(__dirname, 'src')));
app.use(cors());

http.listen(port, () => {
	console.log('listening on :', port);
});

io.on(CONNECTION, (socket) => {

	socket.on(JOIN, (room_name) => {
		//if player is already added then remove
		socket.join(room_name);
		io.emit(JOINED, "Joined");
	});

	socket.on(LEAVE, (room_name) => {
		//if player is added then remove.
		socket.leave(room_name);
		io.emit(LEFT, "Left");
	});

	socket.on(MESSAGE, (message) => {
		if(message.toLowerCase().includes('welcome')){
			io.emit(MESSAGE, { text: message });
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
				io.emit(MESSAGE, { text: 'Something wrong. I answer python questions' });
			} else if (body) {
				//console.log(body)
				io.emit(MESSAGE, body.message);
			}
		});

		//io.emit(MESSAGE, { text: 'Hang on!! getting you there. Im not that cool, I need some time.\n\n\n Processing....' });

	});
});