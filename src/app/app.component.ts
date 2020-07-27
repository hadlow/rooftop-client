import { Component, OnInit, ViewChild } from '@angular/core';

import { Rooftop } from '../rooftop/rooftop';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})

export class AppComponent implements OnInit
{
	public rt: Rooftop;

	constructor()
	{
		
	}

	ngOnInit(): void
	{
		this.rt = new Rooftop;
	}
}