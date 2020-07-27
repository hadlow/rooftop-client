export class Group
{
	public id: string;

	public color: string;

	constructor(id: string, color: string)
	{
		this.id = id;
		this.color = color;
	}

	public toString(): string
	{
		return this.id;
	}
}