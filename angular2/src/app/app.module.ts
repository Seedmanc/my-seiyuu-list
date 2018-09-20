import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {Router} from "@angular/router";
import {HttpClientJsonpModule, HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { TabsComponent } from './tabs/tabs.component';
import { FooterComponent } from './footer/footer.component';
import { RankingComponent } from './ranking/ranking.component';
import {AppRoutingModule} from "./app-routing.module";
import { AnimeListComponent } from './_pages/anime-list/anime-list.component';
import { MagazineListComponent } from './_pages/magazine-list/magazine-list.component';
import { PhotoListComponent } from './_pages/photo-list/photo-list.component';
import { SeiyuuPanelComponent } from './seiyuu-panel/seiyuu-panel.component';
import {OrderByPipe} from "./_misc/orderBy.pipe";
import {RestService} from "./_services/rest.service";
import {MessagesService} from "./_services/messages.service";
import { SpinnerComponent } from './spinner/spinner.component';
import { BaseComponent } from './base/base.component';
import {UniqPipe} from "./_misc/uniq.pipe";
import {env} from "../environments/environment";
import { SortLinkComponent } from './sort-link/sort-link.component';
import {ExternalLinkDirective} from "./_misc/externalLink.directive";

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/bufferToggle';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import "rxjs/add/operator/let";
import "rxjs/add/operator/finally";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/takeUntil";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TabsComponent,
    FooterComponent,
    RankingComponent,
    AnimeListComponent,
    MagazineListComponent,
    PhotoListComponent,
    SeiyuuPanelComponent,
    OrderByPipe,
    UniqPipe,
    SpinnerComponent,
    BaseComponent,
    SortLinkComponent,
    ExternalLinkDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule,
    RouterModule
  ],
  providers: [RestService, MessagesService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    env.loglevel > 2 && console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
