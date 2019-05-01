import {TestBed, inject, async  } from '@angular/core/testing';
import {RoutingService} from "../routing.service";
import {RouterTestingModule} from "@angular/router/testing";
import {appRoutes} from "../../app-routing.module";
import {AnimeListComponent} from "../../_pages/anime-list/anime-list.component";
import {PhotoListComponent} from "../../_pages/photo-list/photo-list.component";
import {MagazineListComponent} from "../../_pages/magazine-list/magazine-list.component";
import {Router} from "@angular/router";
import {HeaderComponent} from "../../header/header.component";
import {SeiyuuPanelComponent} from "../../seiyuu-panel/seiyuu-panel.component";
import {TabsComponent} from "../../tabs/tabs.component";
import {FooterComponent} from "../../footer/footer.component";
import {OrderByPipe} from "../../_misc/orderBy.pipe";
import {RankingComponent} from "../../ranking/ranking.component";
import {SpinnerComponent} from "../../spinner/spinner.component";
import {FormsModule} from "@angular/forms";
import {UniqPipe} from "../../_misc/uniq.pipe";
import { Location} from '@angular/common';
import {SortLinkComponent} from "../../sort-link/sort-link.component";
import {SorterService} from "../sorter.service";
import {Subject} from "rxjs/Subject";
import {ToggleChartComponent} from "../../toggle-chart/toggle-chart.component";
import {AnimeChartComponent} from "../../anime-chart/anime-chart.component";

describe('RoutingService', () => {
  let location: Location;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SorterService],

      declarations: [ SortLinkComponent, AnimeListComponent, MagazineListComponent, FooterComponent, RankingComponent,
        PhotoListComponent, HeaderComponent, SeiyuuPanelComponent, TabsComponent, OrderByPipe, SpinnerComponent, UniqPipe,
      ToggleChartComponent, AnimeChartComponent],

      imports: [RouterTestingModule.withRoutes(appRoutes), FormsModule ],
    });
    router = TestBed.get(Router);
    location = TestBed.get(Location);

    router.initialNavigation();
  });

  it('navigate to "" redirects to /anime/', async(() => {
    router.navigate(['']).then(() => {
      expect(location.path()).toBe('/anime/');
    });
  }));
  it('navigate to "<id>/photos"', async(() => {
    return router.navigate(['photos', 53]).then(() => {
      expect(location.path()).toBe('/photos/53');
    });
  }));

  it('add an existing ID to route', async(inject([RoutingService], (service: RoutingService) => {
      router.navigate(['']).then(()=>{
        let navigateSpy = spyOn(router, 'navigate');

        service.routeId$.next([53, 24]);
        let existing = service.add(53);

        expect(navigateSpy).toHaveBeenCalledWith(['anime', '53,24']);
        expect(existing).toBeTruthy();
      });
    })
   )
  );
  it('remove an existing ID from route', async(inject([RoutingService], (service: RoutingService) => {
      router.navigate(['/photos/53,24']).then(()=>{
        let navigateSpy = spyOn(router, 'navigate');
        service.routeId$.next([53,24]);
        service.remove(53);
        expect(navigateSpy).toHaveBeenCalledWith(['photos', '24']);
      });
    })
   )
  );

  it('should run only on tab', inject([RoutingService], (service: RoutingService) => {
    let source = new Subject();
    let result;

    source.let(service.runOnTab('photo')).subscribe(x => result = x);

    source.next([{name:'derp'}, {name:'hurr'}]);
    expect(result).toBeFalsy();
    service.tab$.next('notphoto');
    expect(result).toBeFalsy();
    service.tab$.next('photo');
    expect(result).toBeTruthy();
    result = null;
    source.next([{name:'durr'}]);
    expect(result).toBeTruthy();
    result = null;
    service.tab$.next('notphoto');
    expect(result).toBeFalsy();
  }));

  //TODO routeId$ can't be properly tested it seems as it requires a real Router
});
