import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AnimeListComponent} from "./anime-list/anime-list.component";
import {MagazineListComponent} from "./magazine-list/magazine-list.component";
import {PhotoListComponent} from "./photo-list/photo-list.component";
import {env} from "../environments/environment";

export const appRoutes: Routes = [
    { path: 'anime/:ids', component: AnimeListComponent },
    { path: 'magazines/:ids', component: MagazineListComponent },
    { path: 'photos/:ids', component:  PhotoListComponent },
    { path: '', redirectTo:  'anime/', pathMatch: 'full' },
    { path: '**',  redirectTo:  '/anime/', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes,
      { enableTracing: env.loglevel > 1 }
      )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
