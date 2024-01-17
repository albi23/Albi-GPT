import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChatComponent} from './components/chat/chat.component';
import {NgOptimizedImage} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LoaderComponent} from './components/loader/loader.component';
import {MouseDecoratorDirective} from './directives/mouse-decorator.directive';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ChatComponent,
    NgOptimizedImage,
    MarkdownModule.forRoot(),
    LoaderComponent,
    MouseDecoratorDirective,
  ],
  providers: [],
  exports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}
