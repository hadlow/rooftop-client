import { Animation } from './animation';
import { Node } from './node';
import { Client } from './client';

export class Mirror extends Node
{
	private moveCallback;

	private nearest: Client;

	private gravitating: boolean = false;

	private gravitatingTime: number;

	private gravitatingAngle: number = 0;

	private gravitatingDistance: number = 0;

	private gravitatingDuration = 0.5;

	constructor(cx: CanvasRenderingContext2D, mirror, image: string = '')
	{
		super(cx);

		this.id = mirror.id;
		this.group = mirror.group;
		this.x = mirror.x;
		this.y = mirror.y;

		if(image)
			this.setImage(image);
		else
			this.color = 'black';

		//this.getUserMedia();
	}

	public animate(secondsPassed: number)
	{
		this.animateGravity(secondsPassed);
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

	public moveTowardsNearest(): void
	{
		this.gravitating = true;
		this.gravitatingAngle = (Math.atan2(this.y - this.nearest.getY(), this.x - this.nearest.getX())) * 180 / Math.PI;
		this.gravitatingDistance = this.nearest.distance(this.x, this.y) -60;
		this.gravitatingTime = this.gravitatingDuration;
	}

	private animateGravity(secondsPassed: number)
	{
		if(this.gravitating)
		{
			this.gravitatingTime -= secondsPassed;

			if(this.gravitatingTime < 0)
			{
				this.gravitating = false;
				this.gravitatingTime = this.gravitatingDuration;
				this.gravitatingDistance = 1;

				this.setAtDistance(60);

				return;
			}

			let distance = Animation.easeInBounce(this.gravitatingTime, 60, this.gravitatingDistance, this.gravitatingDuration);

			this.setAtDistance(distance);
		}
	}

	private setAtDistance(distance)
	{
		this.updatePosition(this.getXFromDistance(distance, this.gravitatingAngle), this.getYFromDistance(distance, this.gravitatingAngle));
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