import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Utils} from "./utils.service";
import {MessagesService} from "./messages.service";
import {Anime, HashOfRoles, Role} from "../_models/anime.model";
import {SeiyuuService} from "./seiyuu.service";
import {RoutingService} from "./routing.service";

@Injectable()
export class AnimeService {
  displayAnime$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  mainOnly$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private animeCount$: Observable<number>;

  constructor(private rest: RestService,
              private msgSvc: MessagesService,
              private routingSvc: RoutingService,
              private seiyuuSvc: SeiyuuService) {

    this.animeCount$ = this.rest.mongoCall({
      coll: 'anime',
      mode: 'GET',
      query: {c: true}
    }).startWith(0)
      .share();

    this.seiyuuSvc.loadedSeiyuu$
      .filter(list => list && list.length === 0)
      .combineLatest(this.seiyuuSvc.totalList$, this.animeCount$)
      .subscribe(([, seiyuus, acount]) => {
         msgSvc.totals(seiyuus.length, acount);   //to reset status when all seiyuu removed
      });


    this.seiyuuSvc.selected$.subscribe(id => {if (id) Anime.activeSeiyuu = id;});

    this.seiyuuSvc.loadedSeiyuu$                                                                           .do(Utils.log('loadedSeiyuuA'))
      .filter(list => list)
      .combineLatest(this.routingSvc.tab$)
        .filter(([,tab]) => tab == 'anime')
        .map(([seiyuus,]) => seiyuus)
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

          return rolesByAnime;
        });
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
              sharedAnime[id].push(...rolesByAnime[id]);
            }
          });
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
          });
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
      .combineLatest(this.seiyuuSvc.selected$.distinctUntilChanged())
      .map(([data]) => data.anime)
      .subscribe(this.displayAnime$);
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
      }).do(Utils.lg('anime requested', 'warn')) :
      Observable.of([])
     )
      .do(details => details.forEach(detail => Anime.detailsCache[detail._id] = detail));
  }

}
