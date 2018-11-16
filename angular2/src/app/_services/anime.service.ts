import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {of} from "rxjs/observable/of";

import {RestService} from "./rest.service";
import {Utils} from "./utils.service";
import {MessagesService} from "./messages.service";
import {Anime, HashOfRoles} from "../_models/anime.model";
import {SeiyuuService} from "./seiyuu.service";
import {RoutingService} from "./routing.service";
import {Seiyuu} from "../_models/seiyuu.model";

@Injectable()
export class AnimeService {
  displayAnime$: ReplaySubject<Anime[]> = new ReplaySubject(1);
  mainOnly$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private rest: RestService,
              private messageSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.rest.mongoCall({
      coll: 'anime',
      mode: 'GET',
      query: {c: true}
    })                                                                                             .do(Utils.lg('AnimeCount requested', 'warn'))
      .do(anime => this.messageSvc.setTotals({anime}))
      .withLatestFrom(this.seiyuuSvc.loadedSeiyuu$.skip(1))
      .filter(([,list]) => !list.length)
      .subscribe(() => this.messageSvc.totals());

    this.seiyuuSvc.selected$.subscribe(id => {if (id) Anime.activeSeiyuu = id;});


    this.seiyuuSvc.loadedSeiyuu$                                                                    .do(Utils.asrt('A loadedSeiyuu', x => Array.isArray(x)))
      .let(this.routingSvc.runOnTab<Seiyuu[]>('anime'))
      .combineLatest(this.mainOnly$.distinctUntilChanged())
      .map(([seiyuus, mainOnly]) => this.animePerSeiyuu(seiyuus, mainOnly))                        .do(Utils.asrt('A roles by anime sets'))
      .map(rolesByAnimeSets => this.sharedAnime(rolesByAnimeSets))                                 .do(Utils.asrt('A shared anime'),
                                                                                                     x => Array.isArray(x) && x[0] && Array.isArray(x[0].rolesBySeiyuu))
      .do(anime => {
        if (anime) {
          this.loadDetails(anime.map(a => a._id).filter(id => !Anime.detailsCache[id]))
            .subscribe();
        }
      })
      .combineLatest(this.seiyuuSvc.selected$.distinctUntilChanged(), x => x)                      .do(Utils.asrt('Anime results'))   // TODO toggle grouping by role tier
      .subscribe(this.displayAnime$);
  }


  private animePerSeiyuu(seiyuus: Seiyuu[], mainOnly: boolean): HashOfRoles[] {
    // make list of anime per seiyuu with each anime containing list of roles for that seiyuu in it
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

      return rolesByAnime;
    });
  }

  private sharedAnime(rolesByAnimeSets: HashOfRoles[]): Anime[] {
    if (!rolesByAnimeSets.length) return null;

    // find shared anime by checking the shortest list for inclusion in all other lists
    let leastAnime = rolesByAnimeSets
      .sort((s1, s2) => Object.keys(s1).length - Object.keys(s2).length);
    let sharedAnime = Object.assign({}, leastAnime[0]);

    leastAnime.slice(1).forEach(rolesByAnime => {
      Object.keys(sharedAnime).forEach(id => {
        if (!rolesByAnime[id]) {
          delete sharedAnime[id];
        } else {
          sharedAnime[id].push(...rolesByAnime[id]);
        }
      });
    });

    // turn the list of shared anime {[animeId]: {main, characterName, #seiyuuId}[]} into the Anime object
    return Object.keys(sharedAnime).map(_id => {
      let rolesBySeiyuu: HashOfRoles = {};

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
      });
    });
  }

  private loadDetails(ids: number[]): Observable<any[]> {

    return (ids.length ?
      this.rest.mongoCall({
        coll: 'anime',
        mode: 'GET',
        query: {
          f: {title: 1, pic: 1},
          q: {'_id': {'$in': ids}}
        }
      })                                                                                       .do(Utils.lg('Anime requested', 'warn')) :
      of([])
     )
      .do(details => details.forEach(detail => Anime.detailsCache[detail._id] = detail));
  }

}
