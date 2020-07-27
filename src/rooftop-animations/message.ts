export class Message
{
	private client: string;

	private message: string;

	public isMirror: boolean;

	public fade: boolean;

	constructor(message: string, client: string, mirror: string, destroy: any)
	{
		this.client = client;
		this.message = message;

		this.isMirror = (mirror == client);
		this.fade = false;

		setTimeout(() =>
		{
			this.fade = true;
		}, 4000);

		setTimeout(() =>
		{
			destroy();
		}, 5000);
	}

	public getMessage(): string
	{
		return this.message;
	}
}