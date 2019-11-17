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
import {env} from "../../environments/environment";
import {EMPTY} from "rxjs/index";

@Injectable()
export class AnimeService {
  displayAnime$: ReplaySubject<Anime[]> = new ReplaySubject(1);
  displayChart$: ReplaySubject<Anime[][][]> = new ReplaySubject(1);
  mainOnly$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  toggleChart$ = new BehaviorSubject(false);

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
      .do(list => {
        if (list.length < 2 && this.toggleChart$.getValue())
          this.toggleChart$.next(false);
      })
      .combineLatest(this.mainOnly$.distinctUntilChanged(), x => x)
      .map(seiyuus => this.animePerSeiyuu(seiyuus))                                                 .do(Utils.asrt('A roles by anime sets'))
      .combineLatest(this.toggleChart$.distinctUntilChanged(), x => x)
      .do(rolesByAnimeSets => {
        if (this.toggleChart$.getValue()) this.makeChart(rolesByAnimeSets);
      })
      .map(rolesByAnimeSets => this.sharedAnime(rolesByAnimeSets,
        this.mainOnly$.getValue() ? 'main' : null)
      )                                                                                             .do(Utils.asrt('A shared anime'),
                                                                                                        x => Array.isArray(x) && x[0] && Array.isArray(x[0].rolesBySeiyuu))
      .do(anime => {
        if (anime && !this.toggleChart$.getValue()) {
          this.loadDetails(anime.map(a => +a._id))
            .subscribe();
        }
      })
      .combineLatest(this.seiyuuSvc.selected$.distinctUntilChanged(), x => x)                      .do(Utils.asrt('Anime results'))
      .subscribe(this.displayAnime$);
  }


  private animePerSeiyuu(seiyuus: Seiyuu[]): HashOfRoles[] {
    // make list of anime per seiyuu with each anime containing list of roles for that seiyuu in it
    return seiyuus.map(({_id, roles}) => {
      let rolesByAnime: HashOfRoles = {};

      roles.forEach(role => {
        if (rolesByAnime[role._id]) {
          rolesByAnime[role._id].push({...role, _id});
        } else {
          rolesByAnime[role._id] = [{...role, _id}];
        }
      });

      return rolesByAnime;
    });
  }

  private sharedAnime(rolesByAnimeSets: HashOfRoles[], tier?: 'main'|'!main'): Anime[] {
    if (!rolesByAnimeSets.length) return null;
    let sharedAnimeMain, result, sharedAnimeRest = [];

    rolesByAnimeSets = JSON.parse(JSON.stringify(rolesByAnimeSets)); //decoupling

    if (tier) { // prefilter the role sets by main tier
      sharedAnimeMain = roleIntersection(
          rolesByAnimeSets.map(hashOfRoles => {
          return Object.keys(hashOfRoles).reduce((acc, cur) => {
            let roleList = hashOfRoles[cur].filter(role => role.main);
            if (roleList.length)
              acc[cur] = roleList;
            return acc;
          }, {});
        })
      );

      if (tier == 'main')
        result = sharedAnimeMain
      else    // return anime where selected seiyuu don't have main roles all at the same time
        result = sharedAnimeRest = roleIntersection(rolesByAnimeSets)
          .filter(anime => !sharedAnimeMain.find(sharedMain => sharedMain._id == anime._id));

      result.total = sharedAnimeMain.length + sharedAnimeRest.length;

      return result;
    }

    return roleIntersection(rolesByAnimeSets);


    function roleIntersection(roleSets: HashOfRoles[]): Anime[] {
      // find shared anime by checking the shortest list for inclusion in all other lists
      let leastAnime = roleSets
        .sort((s1, s2) => Object.keys(s1).length - Object.keys(s2).length);
      let sharedAnime = leastAnime[0];

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

  }

  private makeChart(rolesByAnimeSets: HashOfRoles[]) {
    let total:any = rolesByAnimeSets.map(seiyuu => Object.values(seiyuu));
    total = total.map(seiyuu => seiyuu.length);

     let chart: Anime[][][] = rolesByAnimeSets.map((seiyuuX, x) => {
        return rolesByAnimeSets.map((seiyuuY, y) => {
          let result;
          if (x < y) {
            result = this.sharedAnime([seiyuuX, seiyuuY], 'main'); //TODO choose one algo
            // common titles to a combined pool of titles (excluding dupes)
            result.affinity =  result.length / [...new Set( [...Object.entries(seiyuuX), ...Object.entries(seiyuuY)].filter(([k,s]) => s.some(role => role.main)).map(([k,s]) => k) )]  .length;
            // common titles to one seiyuu's total # of titles (asymmetrical)
            //result.affinity =  result.length /  Object.values(seiyuuX).filter(s => s.some(r => r.main)).length;
            // ser.melipharo's algo
            //let mx = Object.entries(seiyuuX).filter(([k,s]) => s.some(r => r.main)).map(([k]) => k);
            //let my = Object.entries(seiyuuY).filter(([k,s]) => s.some(r => r.main)).map(([k]) => k);
            //result.affinity =  (result.length/ mx.filter(kx => !my.find(y => y==kx)).length + result.length/ my.filter(ky => !mx.find(x => x == ky)).length)/2;
            // symmetrical version of 2nd algo
            //result.affinity = (result.length / mx.length + result.length / my.length)/2
          } else if (x > y) {
            result = this.sharedAnime([seiyuuX, seiyuuY], '!main');
            result.affinity =  result.total / [...new Set([...Object.keys(seiyuuX), ...Object.keys(seiyuuY)])].length;
            //result.affinity =  result.total/ Object.keys(seiyuuX).length;
            //result.affinity =  (result.total/ Object.keys(seiyuuX).filter(kx => !seiyuuY[kx]).length + result.total/ Object.keys(seiyuuY).filter(ky => !seiyuuX[ky]).length)/2;
            //result.affinity =  (result.total / Object.keys(seiyuuX).length + result.total / Object.keys(seiyuuY).length)/2;
          } else
            result = [];
          return result;
        });
      });

     let affinities: number[] = Utils.flattenDeep(chart.map(row => row.map(col => col['affinity'] || 0)));
     let max = Math.max(...affinities);
     let min = Math.min(...affinities.filter(a => !!a)) / 2;

     chart.forEach(row => row.forEach((col:any) => col.affinity = (col.affinity-min) / (max-min) || 0));

     let animeIds = Utils.unique(Utils.flattenDeep<Anime>(chart), '_id')
       .map(a => +a._id);
     this.loadDetails(animeIds)
       .subscribe();

    this.displayChart$.next(chart);
  }

  private loadDetails(ids: number[]): Observable<any[]> {
    ids = ids.filter(id => !Anime.detailsCache[id]).sort();

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
     ).catch(err => {
       this.messageSvc.error('Error loading anime details: ' + err.status);
       console.error(err.message, err.error && (err.error.message || err.error.text));

       if (env.emptyInCatch) return EMPTY;
       throw err
    })
      .do(details => details.forEach(detail => Anime.detailsCache[detail._id] = detail));
  }

}
