import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {RestService} from "./rest.service";
import {Seiyuu} from "../_models/seiyuu.model";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {Utils} from "./utils.service";
import {MessagesService} from "./messages.service";
import {Anime, Role} from "../_models/anime.model";
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinctUntilChanged';

@Injectable()
export class AnimeService {
  mainOnly: BehaviorSubject<boolean> = new BehaviorSubject(false);

  animeCount$: Observable<number>;
  displayAnime$: Observable<Anime[]>;

  currentSeiyuus$: Subject<Seiyuu[]> = new Subject();
  selected$: Subject<number> = new Subject();

  constructor(private rest: RestService, private msgSvc: MessagesService) {
    this.animeCount$ = this.rest.mongoCall({
      coll: 'anime',
      mode: 'GET',
      query: {c: true}
    });

    this.selected$.subscribe(id => Anime.activeSeiyuu = id);

    this.displayAnime$ = this.currentSeiyuus$                                                              .do(Utils.log('ready'))
      .distinctUntilChanged((x,y) =>
        x.map(el => el.name).join() === y.map(el => el.name).join()
      )                                                                                                    .do(Utils.lg('currentSeiyuus'))
      .do(seiyuus => {
        msgSvc.blank();
        seiyuus.length && this.selected$.next(seiyuus[seiyuus.length-1]._id);
      })
      .combineLatest(this.mainOnly)
      .map(([seiyuus, mainOnly]) => {
        // turn objects with arrays of roles with animeIds into hashmaps of roles with seiyuuIds per anime
        return seiyuus.map(({_id, roles}) => {
          let rolesByAnime: {[key: number]: Role[]} = {};

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
      .map(rolesByAnimeSets => {
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
      })
      .map(({anime}) => anime)                                                                             .do(Utils.log('anime results'));
  }

}
