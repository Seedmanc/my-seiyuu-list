import { NgModule } from '@angular/core';
import {RouterModule, Routes, PreloadAllModules} from "@angular/router";
import {AnimeListComponent} from "./anime-list/anime-list.component";
import {MagazineListComponent} from "./magazine-list/magazine-list.component";
import {PhotoListComponent} from "./photo-list/photo-list.component";

const appRoutes: Routes = [
  { path: 'anime', component: AnimeListComponent },
  { path: 'magazines', component: MagazineListComponent },
  { path: 'photos', component:  PhotoListComponent },
  { path: '**', redirectTo:  'anime' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
