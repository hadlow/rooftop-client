import * as Peer from 'simple-peer';
import { Node } from './node';

export class Client extends Node
{
	private peer: Peer;

	constructor(cx: CanvasRenderingContext2D, client)
	{
		super(cx);

		this.id = client.id;
		this.group = client.group;
		this.x = client.x;
		this.y = client.y;

		this.color = 'gray';
	}

	private connect(stream: MediaStream): void
	{
		this.peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		});
	}

	private signal(): void
	{
		this.peer.on('signal', function(data)
		{
			console.log(JSON.stringify(data));
		});
	}

	private stream(): void
	{
		this.peer.on('stream', (stream) =>
		{
			/*
			this.element = document.createElement('video');

			document.body.appendChild(this.element);

			this.element.src = window.URL.createObjectURL(stream);
			this.element.play();
			*/
		});
	}

	private join(): void
	{
		let auth = JSON.parse(document.getElementById('auth').nodeValue);
		
		this.peer.signal(auth);
	}

	public destroy(): void
	{

	}
}