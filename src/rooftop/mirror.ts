import { Node } from './node';
import { Client } from './client';

export class Mirror extends Node
{
	private moveCallback;

	private nearest: Client;

	constructor(cx: CanvasRenderingContext2D, mirror, image: string = '')
	{
		super(cx);

		this.id = mirror.id;
		this.x = mirror.x;
		this.y = mirror.y;

		if(mirror.group == '')
		{
			this.group = undefined;
		} else {
			let group = JSON.parse(mirror.group);

			this.joinGroup(group.id, group.color);
		}

		if(image)
			this.setImage(image);
		else
			this.color = 'black';

		//this.getUserMedia();
	}

	public animate(secondsPassed: number)
	{
		
	}

	public updatePosition(x: number, y: number): void
	{
		this.x = x;
		this.y = y;

		this.moveCallback(this.x, this.y);
	}

	public on(action, callback): void
	{
		if(action == 'move')
			this.moveCallback = callback;
	}

	public setNearest(client: Client = null): void
	{
		if(client == null)
			this.nearest = null;
		else
			this.nearest = client;
	}

	public getNearest(): Client
	{
		return this.nearest;
	}

	private getXFromDistance(distance: number, angle: number)
	{
		return Math.round(Math.cos(angle * Math.PI / 180) * distance + this.nearest.getX());
	}

	private getYFromDistance(distance: number, angle: number)
	{
		return Math.round(Math.sin(angle * Math.PI / 180) * distance + this.nearest.getY());
	}

	private getUserMedia(): void
	{
		var browser = <any>navigator;

		browser.getUserMedia = (browser.getUserMedia ||
			browser.webkitGetUserMedia ||
			browser.mozGetUserMedia ||
			browser.msGetUserMedia);

		//browser.mediaDevices.getUserMedia({ video: { width: 240, height: 240 }, audio: false }).then((stream: MediaStream) =>
		browser.mediaDevices.getUserMedia({ audio: true }).then((stream: MediaStream) =>
		{
			//console.log(stream);
		}, function(error)
		{
			console.error(error);
		});
	}
}