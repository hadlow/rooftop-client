import { Animation } from './animation';
import { Group } from './group';

export class Node
{
	protected cx: CanvasRenderingContext2D;

	protected id: string;

	protected x: number = 0;

	protected y: number = 0;

	protected group: Group;

	protected name: string;

	protected color: string;

	protected image: HTMLImageElement;

	private near: boolean;

	private nearAnimationLevel: number;

	private nearAnimationTime: number;

	private radius: number = 30;

	constructor(cx: CanvasRenderingContext2D)
	{
		this.cx = cx;

		this.group = undefined;
;
		this.nearAnimationLevel = 0;
		this.nearAnimationTime = 0;
	}

	public getId(): string
	{
		return this.id;
	}
	
	public getX(): number
	{
		return this.x;
	}

	public getY(): number
	{
		return this.y;
	}

	public getGroup(): Group
	{
		return this.group;
	}

	public joinGroup(id: string, color: string)
	{
		this.group = new Group(id, color);
	}

	public leaveGroup()
	{
		this.group = undefined;
	}

	public setNear(): void
	{
		this.near = true;
	}

	public setFar(): void
	{
		this.near = false;
	}

	public isNear(): boolean
	{
		return this.near;
	}

	public setImage(image: string)
	{
		this.image = new Image();
		
		this.image.src = image;
	}

	public distance(x: number, y: number): number
	{
		return Math.sqrt(Math.pow((y - this.y), 2) + Math.pow((x - this.x), 2));
	}

	public animate(secondsPassed: number)
	{
		if(this.near)
		{
			if(this.nearAnimationTime < 0.25)
			{
				this.nearAnimationTime += secondsPassed;
				this.nearAnimationLevel = Animation.easeOutQuad(this.nearAnimationTime, 0, 150, .25);
			}
		} else {
			if(this.nearAnimationTime > 0)
			{
				this.nearAnimationTime -= secondsPassed;
				this.nearAnimationLevel = Animation.easeOutQuad(this.nearAnimationTime, 0, 150, .25);
			}
		}
	}

	public drawGlow(originX: number, originY: number)
	{
		if(this.nearAnimationLevel > 0)
		{
			this.cx.beginPath();
			this.cx.arc(this.x - originX, this.y - originY, this.nearAnimationLevel, 0, 2 * Math.PI, false);
			this.cx.fillStyle = '#ececf7';
			this.cx.fill();
		}
	}

	private drawX(originX: number, canvasWidth: number)
	{
		if(this.x - originX - this.radius < 0 - this.radius)
			return 0;

		if(this.x - originX - this.radius > canvasWidth - this.radius)
			return canvasWidth;

		return this.x - originX;
	}

	private drawY(originY: number, canvasHeight: number)
	{
		if(this.y - originY - this.radius < 0 - this.radius)
			return 0;

		if(this.y - originY - this.radius > canvasHeight - this.radius)
			return canvasHeight;

		return this.y - originY;
	}

	private outOfView(originX: number, originY: number, canvasWidth: number, canvasHeight: number): boolean
	{
		return (
			(this.x - originX - this.radius < 0 - this.radius) ||
			(this.x - originX - this.radius > canvasWidth - this.radius) ||
			(this.y - originY - this.radius < 0 - this.radius) ||
			(this.y - originY - this.radius > canvasHeight - this.radius)
		);
	}

	public draw(originX: number, originY: number, canvasWidth: number, canvasHeight: number)
	{
		let x = this.drawX(originX, canvasWidth);
		let y = this.drawY(originY, canvasHeight);

		if(this.outOfView(originX, originY, canvasWidth, canvasHeight))
			this.cx.globalAlpha = 0.5;
		else
			this.cx.globalAlpha = 1;

		if(this.group != undefined)
		{
			this.cx.beginPath();
			this.cx.arc(x, y, this.radius + 4, 0, 2 * Math.PI, false);
			this.cx.fillStyle = '#' + this.group.color;
			this.cx.fill();

			//this.cx.font = "10px Monospace";
			//this.cx.fillText(this.group.id, x + 34, y);
		}
		
		if(this.image)
		{
			this.cx.drawImage(this.image, x - this.radius, y - this.radius, 60, 60);
		} else {
			this.cx.beginPath();
			this.cx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
			this.cx.fillStyle = this.color;
			this.cx.fill();
		}
	}

	public updatePosition(x: number, y: number): void
	{
		this.x = x;
		this.y = y;
	}

	public atPosition(x: number, y: number, originX: number, originY: number): boolean
	{
		var dx = (this.x - originX) - x;
		var dy = (this.y - originY) - y;
		let r = 30;
			
		return (dx * dx + dy * dy <= r * r);
	}
}