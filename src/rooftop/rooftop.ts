import io from 'socket.io-client';

import { Canvas } from './canvas';
import { Client } from './client';
import { Mirror } from './mirror';
import { Message } from './message';

export class Rooftop
{
	private canvas: Canvas;
	
	private socket: any;

	private client: string;

	private room: string;

	private messages: Message[] = [];

	constructor()
	{
		this.connect();

		this.canvas = new Canvas(document.getElementById('canvas'), (action: string, params: any) =>
		{
			let payload = Object.assign({"client": this.client, "room": this.room}, params);

			this.socket.emit(action, payload);
		});
	}

	public getMessages(): Message[]
	{
		return this.messages;
	}

	public sendMessage(message: string)
	{
		if(message == '')
			return;

		this.socket.emit('message', {"client": this.client, "room": this.room, message: message});
	}

	private connect()
	{
		this.socket = io('http://localhost:3000');

		if(location.hash == '')
			this.createRoom();
		else
			this.joinRoom();

		this.watchForNew();

		this.watchForMove();

		this.watchForGroup();

		this.watchForMessage();

		this.watchForLeave();

		this.watchForErrors();
	}

	private createRoom()
	{
		this.socket.emit('create', {});

		this.socket.on('created', (client) =>
		{
			this.client = client.id;
			this.room = client.room;
			
			this.canvas.setClient(this.client);
			this.canvas.setMirror(client);

			location.hash = this.room;

			console.log('Room created #' + this.room);
		});
	}

	private joinRoom()
	{
		this.room = location.hash.replace('#', '');

		this.socket.emit('join', {
			"room": this.room
		}); // Probably a good idea that clients don't see other client's socket IDs

		this.socket.on('joined', (data) =>
		{
			this.client = data.mirror.id;
			this.room = data.mirror.room;
			
			this.canvas.setClient(this.client);
			this.canvas.setMirror(data.mirror);

			for(let client of data.clients)
			{
				if(client.id != this.client)
					this.canvas.addClient(client);
			}

			console.log('Room joined #' + this.room);
		});
	}

	private watchForNew()
	{
		this.socket.on('new', (data) =>
		{
			if(data.id != this.client)
				this.canvas.addClient(data);
		});
	}

	private watchForMessage()
	{
		this.socket.on('message', (data) =>
		{
			let message = new Message(data.message, data.id, this.client, () =>
			{
				this.messages.shift();
			});

			this.messages.push(message);
		});
	}

	private watchForMove()
	{
		this.socket.on('moved', (data) =>
		{
			this.canvas.updateClientLocation(data.id, data.location[0], data.location[1]);
		});
	}

	private watchForGroup()
	{
		this.socket.on('grouped', (data) =>
		{
			this.canvas.updateGroups(data.client, data.group);
		});

		this.socket.on('degrouped', (data) =>
		{
			this.canvas.leftGroup(data.client);
		});
	}

	private watchForLeave()
	{
		this.socket.on('leave', (data) =>
		{
			this.canvas.removeClient(data);
		});
	}

	private watchForErrors()
	{
		this.socket.on('created.error', (error) =>
		{
			console.error(error);

			alert(error);
		});

		this.socket.on('joined.error', (error) =>
		{
			console.error(error);

			alert(error);
		});
	}
}