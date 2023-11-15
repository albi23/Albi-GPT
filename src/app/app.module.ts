import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {ChatComponent} from './components/chat/chat.component';
import {NgForTrackByFieldDirective} from './directives/ng-for-track-by-field.directive';
import {NgOptimizedImage} from '@angular/common';
import {MarkdownModule} from 'ngx-markdown';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChatComponent,
    NgOptimizedImage,
    NgForTrackByFieldDirective,
    MarkdownModule.forRoot(),

  ],
  providers: [],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
