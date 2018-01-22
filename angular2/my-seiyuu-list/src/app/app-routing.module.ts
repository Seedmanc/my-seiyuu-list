import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {AnimeListComponent} from "./anime-list/anime-list.component";
import {MagazineListComponent} from "./magazine-list/magazine-list.component";
import {PhotoListComponent} from "./photo-list/photo-list.component";
import {BaseComponent} from "./base/base.component";

export const appRoutes: Routes = [
  { path: ':ids', component: BaseComponent,
    children: [
    { path: 'anime', component: AnimeListComponent },
    { path: 'magazines', component: MagazineListComponent },
    { path: 'photos', component:  PhotoListComponent },
    { path: '', redirectTo:  'anime', pathMatch: 'full' }
  ] },
  { path: '',  redirectTo:  '-', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
