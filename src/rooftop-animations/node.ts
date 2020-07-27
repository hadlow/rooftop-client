import { Animation } from './animation';

export class Node
{
	protected cx: CanvasRenderingContext2D;

	protected id: string;

	protected x: number = 0;

	protected y: number = 0;

	protected group: string;

	protected name: string;

	protected color: string;

	protected image: HTMLImageElement;

	private near: boolean;

	private nearAnimationLevel: number;

	private nearAnimationTime: number;

	constructor(cx: CanvasRenderingContext2D)
	{
		this.cx = cx;

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

	public getGroup(): string
	{
		return this.group;
	}

	public joinGroup(group: string)
	{
		this.group = group;
	}

	public leaveGroup()
	{
		this.group = '';
	}

	public setNear(): void
	{
		if(!this.near)
			this.nearAnimationTime = 0;

		this.near = true;
	}

	public setFar(): void
	{
		this.near = false;

		this.nearAnimationTime = 0;
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
				this.nearAnimationLevel = Animation.easeOutQuad(this.nearAnimationTime, 0, 100, .25);
			}
		} else {
			if(this.nearAnimationTime < 0.5)
			{
				this.nearAnimationTime += secondsPassed;
				//this.nearAnimationLevel = this.easeOutQuad(this.nearAnimationTime, 0, 100, .25);
			}
		}
	}

	public drawGlow(originX: number, originY: number)
	{
		this.cx.beginPath();
		this.cx.arc(this.x - originX, this.y - originY, this.nearAnimationLevel, 0, 2 * Math.PI, false);
		this.cx.fillStyle = '#ececf7';
		this.cx.fill();
	}

	public draw(originX: number, originY: number)
	{
		if(this.image)
		{
			this.cx.drawImage(this.image, this.x - originX - 30, this.y - originY - 30, 60, 60);
		} else {
			this.cx.beginPath();
			this.cx.arc(this.x - originX, this.y - originY, 30, 0, 2 * Math.PI, false);
			this.cx.fillStyle = this.color;
			this.cx.fill();
		}

		this.cx.font = "10px Monospace";
		this.cx.fillText(this.group, this.x - originX + 34, this.y - originY);
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