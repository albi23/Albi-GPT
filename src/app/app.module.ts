import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChatComponent} from './components/chat/chat.component';
import {NgOptimizedImage} from "@angular/common";

@NgModule({
    declarations: [
        AppComponent,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChatComponent,
    NgOptimizedImage
  ],
    providers: [],
    exports: [

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
