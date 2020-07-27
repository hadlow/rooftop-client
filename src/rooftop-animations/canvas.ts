import { Client } from './client';
import { Mirror } from './mirror';

export class Canvas
{
	private secondsPassed = 0;

	private oldTimestamp = 0;

	private canvas: HTMLCanvasElement;

	private cx: CanvasRenderingContext2D;

	private width: number = 0;

	private height: number = 0;

	private originX: number = 0;

	private originY: number = 0;

	private mouseX: number = 0;

	private mouseY: number = 0;

	private mouseXOnClick: number = 0;

	private mouseYOnClick: number = 0;

	private mouseOnMirror: boolean = false;

	private dpr: number = 1;

	private zoomIndex: number = 2;

	private zoomBreaks: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

	private mousedown: boolean = false;

	private client: string;

	private clients: Client[] = [];

	private mirror: Mirror;

	private emit: any;

	private bg: HTMLImageElement;

	private bgSize: number;
	
	constructor(canvas: any, emit: any)
	{
		this.canvas = canvas;
		this.emit = emit;
		
		this.setupCanvas();

		this.frame(0);
	}

	public setClient(client: string)
	{
		this.client = client;
	}

	public setMirror(mirror)
	{
		this.mirror = new Mirror(this.cx, mirror, '/assets/img/profile.png');

		this.originX = 0 - (this.width / 2) + this.mirror.getX();
		this.originY = 0 - (this.height / 2) + this.mirror.getY();

		this.mirror.on('move', (x: number, y: number) =>
		{
			this.emit('move', {"location": [x, y]});
		});
	}

	public getMirror()
	{
		return this.mirror;
	}

	public addClient(data: any): void
	{
		let client = new Client(this.cx, data);

		// If client doesn't exist
		let index = this.clients.map(function(e: any) { return e.id; }).indexOf(client.getId());

		if(index < 0)
			this.clients.push(client);

		let mirror = this.clients.map(function(e: any) { return e.id; }).indexOf(this.client);

		if(mirror > -1)
			this.clients.splice(mirror, 1);
	}

	public removeClient(id)
	{
		let index = this.clients.map(function(e: any) { return e.id; }).indexOf(id);

		if(index > -1)
			this.clients.splice(index, 1);
	}

	public updateMirrorLocation(x: number, y: number)
	{
		this.mirror.updatePosition(x, y);
	}

	public updateClientLocation(id: string, x: number, y: number): void
	{
		for(let client of this.clients)
		{
			if(client.getId() == id)
				client.updatePosition(x, y);
		}
	}

	public updateGroups(id: string, group: string)
	{
		if(id == this.mirror.getId())
			return this.mirror.joinGroup(group);

		for(let client of this.clients)
		{
			if(client.getId() == id)
			{
				client.joinGroup(group);
				console.log("Client " + client.getId() + " joined group: " + group);
			}
		}
	}

	private setupCanvas(): void
	{
		this.cx = this.canvas.getContext('2d');
		this.dpr = this.calcScale();
		this.width = this.canvas.offsetWidth;
		this.height = this.canvas.offsetHeight;
		this.canvas.width = ((this.canvas.offsetWidth * this.dpr));
		this.canvas.height = ((this.canvas.offsetHeight * this.dpr));
		this.cx.scale((this.zoomBreaks[this.zoomIndex] * this.dpr), (this.zoomBreaks[this.zoomIndex] * this.dpr));
		this.loadBg();

		this.onResize();
		this.onMouseDown();
		this.onMouseUp();
		this.onMouseMove();
	}

	private onResize(): void
	{
		window.addEventListener('resize', () =>
		{
			this.width = this.canvas.offsetWidth;
			this.height = this.canvas.offsetHeight;
			this.canvas.width = ((this.canvas.offsetWidth * this.dpr));
			this.canvas.height = ((this.canvas.offsetHeight * this.dpr));
			this.cx.scale((this.zoomBreaks[this.zoomIndex] * this.dpr), (this.zoomBreaks[this.zoomIndex] * this.dpr));
		});
	}

	private onMouseDown(): void
	{
		this.canvas.onmousedown = () =>
		{
			this.mousedown = true;
			this.mouseXOnClick = this.mouseX;
			this.mouseYOnClick = this.mouseY;

			this.dragCursor(true);

			if(this.mirror.atPosition(this.mouseX, this.mouseY, this.originX, this.originY))
				this.mouseOnMirror = true;
			else
				this.mouseOnMirror = false;

			if(this.mouseOnMirror)
				this.highlightNearest(this.mirror.getX(), this.mirror.getY());
		};
	}

	private onMouseUp(): void
	{
		this.canvas.onmouseup = () =>
		{
			this.mousedown = false;

			this.dragCursor(false);

			if(this.mouseOnMirror)
			{
				if(this.mirror.isNear())
				{
					if(this.mirror.getGroup() != this.mirror.getNearest().getGroup() || this.mirror.getGroup() == '')
					{
						let group = this.mirror.getNearest().getGroup();

						if(group == '')
						{
							this.emit('group.create', {"joining": this.mirror.getNearest().getId()});
							console.log('group created');
						} else {
							this.emit('group.join', {"group": group});
							console.log('group joined: ' + group);
						}
					}

					this.mirror.moveTowardsNearest();
				} else {
					if(this.mirror.getGroup() != '')
					{
						this.emit('group.join', {"group": ''});
					}
				}

				this.mirror.setFar();

				for(let client of this.clients)
					client.setFar();
			}
		};
	}

	private onMouseMove(): void
	{
		this.canvas.onmousemove = (event) =>
		{
			this.mouseX = event.x;
			this.mouseY = event.y;

			if(this.mousedown)
			{
				if(this.mouseOnMirror)
				{
					let cxx = this.mouseXOnClick - this.mouseX;
					let cyy = this.mouseYOnClick - this.mouseY;
					this.mouseXOnClick = this.mouseX;
					this.mouseYOnClick = this.mouseY;

					let newX = this.mirror.getX() - cxx;
					let newY = this.mirror.getY() - cyy;

					this.mirror.updatePosition(newX, newY);
					this.highlightNearest(newX, newY);
				}

				if(!this.mouseOnMirror)
				{
					let cxx = this.mouseXOnClick - this.mouseX;
					let cyy = this.mouseYOnClick - this.mouseY;
					this.mouseXOnClick = this.mouseX;
					this.mouseYOnClick = this.mouseY;

					this.originX = this.originX + cxx;
					this.originY = this.originY + cyy;
				}
			}
		};
	}

	private frame(timestamp)
	{
		let secondsPassed = (timestamp - this.oldTimestamp) / 1000;
		this.oldTimestamp = timestamp;
	
		requestAnimationFrame(this.frame.bind(this));

		this.cx.clearRect(0, 0, this.width, this.height);

		this.drawBg();

		this.animate(secondsPassed);

		this.drawClientBg();

		this.drawClients();

		this.drawMirror();
	}

	private animate(secondsPassed: number)
	{
		for(let client of this.clients)
			client.animate(secondsPassed);

		if(this.mirror)
			this.mirror.animate(secondsPassed);
	}

	private drawClientBg()
	{
		this.cx.save();
		this.cx.globalAlpha = 0.4;

		for(let client of this.clients)
			client.drawGlow(this.originX, this.originY);

		this.cx.restore();
	}

	private drawClients()
	{
		for(let client of this.clients)
			client.draw(this.originX, this.originY);
	}

	private drawMirror()
	{
		if(this.mirror)
			this.mirror.draw(this.originX, this.originY);
	}

	private calcScale()
	{
		if('devicePixelRatio' in window)
			return window.devicePixelRatio || 1;

		return 1;
	}

	private highlightNearest(x: number, y: number)
	{
		let nearest: Client = this.clients[0];
		let distance = 0;

		for(let client of this.clients)
		{
			client.setFar();

			distance = client.distance(x, y);

			if(distance < nearest.distance(x, y))
				nearest = client;
		}

		if(nearest)
		{
			if(nearest.distance(x, y) < 150)
			{
				nearest.setNear();
				this.mirror.setNear();
				this.mirror.setNearest(nearest);
	
				for(let client of this.clients)
				{
					if(client.getGroup() == nearest.getGroup() && client.getGroup() != '')
					{
						client.setNear();
					}
				}
			} else {
				nearest.setFar();
				this.mirror.setFar();
				this.mirror.setNearest();
			}
		}
	}

	private dragCursor(drag: boolean): void
	{
		if(drag)
			this.canvas.style.cursor = 'grabbing';
		else
			this.canvas.style.cursor = 'default';
	}

	private loadBg()
	{
		this.bg = new Image();
		this.bgSize = 1000;

		this.bg.src = '/assets/img/backgrounds/shapes.svg';
	}

	private drawBg()
	{
		let ox = (this.originX / 3) * -1;
		let oy = (this.originY / 3) * -1;

		let tilesX = this.width / this.bgSize;
		let tilesY = this.height / this.bgSize;

		let distanceX = (Math.ceil(ox / this.bgSize)) * -1;
		let distanceY = (Math.ceil(oy / this.bgSize)) * -1;

		for(let x = distanceX; x < distanceX + tilesX + 1; x++)
		{
			for(let y = distanceY; y < distanceY + tilesY + 1; y++)
			{
				this.cx.drawImage(this.bg, ox + (this.bgSize * x), oy + (this.bgSize * y), this.bgSize, this.bgSize);
			}
		}
	}
}