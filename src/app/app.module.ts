import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgInitDirective } from 'src/directives/onInit';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
	declarations: [
		NgInitDirective,
		AppComponent,
		ChatComponent
	],
	imports: [
		BrowserModule
	],
	providers: [],
	bootstrap: [AppComponent]
})

export class AppModule
{

}