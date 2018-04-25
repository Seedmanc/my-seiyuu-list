import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import {OrderByPipe} from "./orderBy.pipe";
import {Router} from "@angular/router";

import {HttpClientModule} from '@angular/common/http';
import {RestService} from "./_services/rest.service";
import {MessagesService} from "./_services/messages.service";
import { SpinnerComponent } from './spinner/spinner.component';
import { BaseComponent } from './base/base.component';
import {UniqPipe} from "./uniq.pipe";
import {Utils} from "./_services/utils.service";
import {AnimeService} from "./_services/anime.service";
import {env} from "../environments/environment";
import { SortLinkComponent } from './sort-link/sort-link.component';
import {PhotoService} from "./_services/photo.service";

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
    SortLinkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule
  ],
  providers: [RestService, MessagesService, Utils, AnimeService, PhotoService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router) {
    env.loglevel > 1 && console.log('Routes: ', JSON.stringify(router.config, undefined, 2));
  }
}
