import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {MessagesService} from "./messages.service";
import {Anime, HashOfRoles, Role} from "../_models/anime.model";
import {SeiyuuService} from "./seiyuu.service";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/distinctUntilChanged';

@Injectable()
export class AnimeService {
  animeCount$: Observable<number>;

  displayAnime$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  selected$: BehaviorSubject<number> = new BehaviorSubject(null);
  mainOnly$: BehaviorSubject<boolean> = new BehaviorSubject(false);


  constructor(private rest: RestService, private msgSvc: MessagesService,
              private seiyuuSvc: SeiyuuService) {
    this.animeCount$ = this.rest.mongoCall({
      coll: 'anime',
      mode: 'GET',
      query: {c: true}
    });

    this.selected$.subscribe(id => {if (id) Anime.activeSeiyuu = id});

    this.seiyuuSvc.loadedSeiyuu$                                                                           .do(Utils.log('ready'))
      .distinctUntilChanged((x,y) =>
        x.map(el => el.name).join() === y.map(el => el.name).join()
      )                                                                                                    .do(Utils.lg('loadedSeiyuu'))
      .withLatestFrom(this.seiyuuSvc.seiyuuCount$, this.animeCount$)
      .do(([seiyuus, scount, acount]) => {
        if (seiyuus.length) {
          this.selected$.next(seiyuus[seiyuus.length-1]._id);
        } else {
          msgSvc.totals(scount, acount);
        }
      })
      .map(([seiyuus]) => seiyuus)
      .combineLatest(this.mainOnly$)
      .map(([seiyuus, mainOnly]) => {
        // turn objects with arrays of roles with animeIds into hashmaps of roles with seiyuuIds per anime
        return seiyuus.map(({_id, roles}) => {
          let rolesByAnime: HashOfRoles = {};

          roles.forEach(role => {
            if (!mainOnly || role.main) {
              if (rolesByAnime[role._id]) {
                rolesByAnime[role._id].push({...role, _id});
              } else {
                rolesByAnime[role._id] = [{...role, _id}];
              }
            }
          });

          return rolesByAnime
        })
      })
      .map((rolesByAnimeSets: HashOfRoles[]) => {
        // find shared anime by checking the shortest list for inclusion in all other lists
        let leastAnime = rolesByAnimeSets
          .sort((s1, s2) => Object.keys(s1).length - Object.keys(s2).length);
        let sharedAnime = Object.assign({}, leastAnime[0]);

        leastAnime.slice(1).forEach(rolesByAnime => {
          Object.keys(sharedAnime).forEach(id => {
            if (!rolesByAnime[id]) {
              delete sharedAnime[id];
            } else {
              sharedAnime[id].push(...rolesByAnime[id])
            }
          })
        });

        let result = Object.keys(sharedAnime).map(_id => {
          let rolesBySeiyuu: {[key: number]: Role[]} = {};

          sharedAnime[_id].forEach(anime => {
            if (rolesBySeiyuu[anime._id]) {
              rolesBySeiyuu[anime._id].push(anime);
            } else {
              rolesBySeiyuu[anime._id] = [anime];
            }
          });
          return new Anime({
            _id,
            rolesBySeiyuu
          })
        });

        return {anime: result, seiyuuCount: rolesByAnimeSets.length};
      })
      .do(({anime, seiyuuCount}) => {
        if (seiyuuCount) {
          this.msgSvc.status(
            `${anime.length || 'no'} ${seiyuuCount > 1 ? 'shared ' : ''}anime found`
          );
        }

        this.loadDetails(anime.map(a => a._id).filter(id => !Anime.detailsCache[id]))                       .do(Utils.log('details'))
          .subscribe();
      })                                                                                                   .do(Utils.log('anime results'))
      .combineLatest(this.selected$.distinctUntilChanged())
      .map(([data]) => data.anime)                                                                         .do(Utils.lg('combined'))
      .subscribe(this.displayAnime$);
  }

  private loadDetails(ids: number[]): Observable<any> {

    return (ids.length ?
      this.rest.mongoCall({
        coll: 'anime',
        mode: 'GET',
        query: {
          f: {title: 1, pic: 1},
          q: {'_id': {'$in': ids}}
        }
      }) :
      Observable.of([])
     )
      .do(details => details.forEach(detail => Anime.detailsCache[detail._id] = detail));
  }

}
