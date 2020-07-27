import { Component, OnInit } from '@angular/core';

import { Rooftop } from '../../rooftop/rooftop';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit
{
	public rt: Rooftop;
	
	constructor()
	{

	}

	ngOnInit(): void
	{
		//this.rt.setMirror(this.mirror.nativeElement);
		this.rt = new Rooftop;
	}

	sendMessage(message: string): void
	{
		this.rt.sendMessage(message);
	}
}