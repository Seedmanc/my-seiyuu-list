import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { SeiyuuListComponent } from './seiyuu-list/seiyuu-list.component';
import { TabsComponent } from './tabs/tabs.component';
import { FooterComponent } from './footer/footer.component';
import { RankingComponent } from './ranking/ranking.component';
import {AppRoutingModule} from "./app-routing.module";
import { AnimeListComponent } from './anime-list/anime-list.component';
import { MagazineListComponent } from './magazine-list/magazine-list.component';
import { PhotoListComponent } from './photo-list/photo-list.component';
import { SeiyuuPanelComponent } from './seiyuu-panel/seiyuu-panel.component';
import {OrderByPipe} from "./orderBy.pipe";

import {HttpClientModule} from '@angular/common/http';
import {SeiyuuService} from "./_services/seiyuu.service";
import {RestService} from "./_services/rest.service";
import {MessagesService} from "./_services/messages.service";
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SeiyuuListComponent,
    TabsComponent,
    FooterComponent,
    RankingComponent,
    AnimeListComponent,
    MagazineListComponent,
    PhotoListComponent,
    SeiyuuPanelComponent,
    OrderByPipe,
    SpinnerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule
  ],
  providers: [SeiyuuService, RestService, MessagesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
