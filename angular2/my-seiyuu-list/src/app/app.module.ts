import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

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
    PhotoListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
