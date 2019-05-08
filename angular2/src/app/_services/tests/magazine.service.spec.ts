import {TestBed, inject } from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RestService} from "../rest.service";
import {MessagesService} from "../messages.service";
import {SeiyuuService} from "../seiyuu.service";
import {RoutingServiceMock} from "./routing.service.mock";
import {RoutingService} from "../routing.service";
import { Seiyuu} from "../../_models/seiyuu.model";
import {of} from "rxjs/observable/of";
import {SeiyuuServiceMock} from "./seiyuu.service.mock";
import {MagazineService} from "../magazine.service";

let x;

describe('MagazineService', () => {
  x = undefined;
  let service: MagazineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesService, MagazineService,
        {provide: RoutingService, useClass: RoutingServiceMock},  {provide: SeiyuuService, useClass: SeiyuuServiceMock}
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.get(MagazineService);
  });

  it('should load magazines for a single seiyuu',
    inject([SeiyuuService, RestService, RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService,  routingSvc: RoutingService) => {
      service.displayMagazines$.subscribe(data => x = data);
      service.pending = true;

      let spy = spyOn(rest, 'googleQueryCall').and
        .returnValue(of(
{"version":"0.6","reqId":"0","status":"ok","sig":"229708994","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"}],
  "rows":[{"c":[{"v":"22 2005"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"23 2006"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"24 2007"},{"v":"Seiyuu Animedia:"},{"v":"Maeda Konomi, Chihara Minori"}]}]}
} ));

      routingSvc.tab$.next('magazines');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'})]);

      expect(spy).toHaveBeenCalledWith(['Maeda Konomi']);
      expect(JSON.stringify(x)).toBe(JSON.stringify([{"magazine":"hm3 Special","issues":[{"issue":"22 2005","seiyuus":["Chihara Minori", 'Maeda Konomi']},
        {"issue":"23 2006","seiyuus":["Chihara Minori", 'Maeda Konomi']}]},
        {"magazine":"Seiyuu Animedia","issues":[{"issue":"24 2007","seiyuus":["Chihara Minori", 'Maeda Konomi']} ]}]));
      expect(service.pending).toBeFalsy();
    })
  );

  it('should load magazines for multiple seiyuu',
    inject([SeiyuuService, RestService, RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService,  routingSvc: RoutingService) => {
      service.displayMagazines$.subscribe(data => x = data);
      service.pending = true;

      let spy = spyOn(rest, 'googleQueryCall').and
        .returnValue(of(
{"version":"0.6","reqId":"0","status":"ok","sig":"229708994","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"}],
  "rows":[{"c":[{"v":"22 2005"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"23 2006"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"24 2007"},{"v":"Seiyuu Animedia:"},{"v":"Maeda Konomi, Chihara Minori"}]}]}
} ));

      routingSvc.tab$.next('magazines');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'}), new Seiyuu({name: 'Chihara Minori'})]);

      expect(spy).toHaveBeenCalledWith(['Chihara Minori', 'Maeda Konomi']);

      expect(JSON.stringify(x)).toBe(JSON.stringify([{"magazine":"hm3 Special","issues":[{"issue":"22 2005","seiyuus":["Chihara Minori", 'Maeda Konomi']},
        {"issue":"23 2006","seiyuus":["Chihara Minori", 'Maeda Konomi']}]},
        {"magazine":"Seiyuu Animedia","issues":[{"issue":"24 2007","seiyuus":["Chihara Minori", 'Maeda Konomi']} ]}]));
      expect(service.pending).toBeFalsy();
    })
  );

  it('should take magazines from cache on repeating queries',
    inject([SeiyuuService, RestService , RoutingService],
       (seiyuuSvc: SeiyuuService, rest: RestService,  routingSvc: RoutingService) => {
      service.displayMagazines$.subscribe( data  => x = data);
      service.pending = true;

      let spy = spyOn(rest, 'googleQueryCall').and
        .returnValue(of(
{"version":"0.6","reqId":"0","status":"ok","sig":"229708994","table":{"cols":[{"id":"A","label":"","type":"string"},{"id":"B","label":"","type":"string"},{"id":"C","label":"","type":"string"}],
  "rows":[{"c":[{"v":"22 2005"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"23 2006"},{"v":"hm3 Special:"},{"v":"Maeda Konomi, Chihara Minori"}]},
          {"c":[{"v":"24 2007"},{"v":"Seiyuu Animedia:"},{"v":"Maeda Konomi, Chihara Minori"}]}]}
} ));

      routingSvc.tab$.next('magazines');
      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'}), new Seiyuu({name: 'Chihara Minori'})]);

      expect(spy).toHaveBeenCalledWith(['Chihara Minori', 'Maeda Konomi']);

      expect(JSON.stringify(x)).toBe(JSON.stringify([{"magazine":"hm3 Special","issues":[{"issue":"22 2005","seiyuus":["Chihara Minori", 'Maeda Konomi']},
        {"issue":"23 2006","seiyuus":["Chihara Minori", 'Maeda Konomi']}]},
        {"magazine":"Seiyuu Animedia","issues":[{"issue":"24 2007","seiyuus":["Chihara Minori", 'Maeda Konomi']} ]}]));
      expect(service.pending).toBeFalsy();


      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Davidyuk Jenya'})]);
      expect(spy).toHaveBeenCalledWith(['Davidyuk Jenya']);

      seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'}), new Seiyuu({name: 'Chihara Minori'})]);
      expect(spy).toHaveBeenCalledTimes(2);
    })
  );

   it('should report errors',
    inject([SeiyuuService, RestService, RoutingService, MessagesService],
      (seiyuuSvc: SeiyuuService, rest: RestService,  routingSvc: RoutingService, msgSvc: MessagesService) => {
        service.displayMagazines$.subscribe(data => x = data);
        service.pending = true;

        let spy = spyOn(rest, 'googleQueryCall').and
          .returnValue(of(
            {
              errors: [{message:'test'}]
            } ));
        let spy2=spyOn(msgSvc,'error');

        routingSvc.tab$.next('magazines');
        seiyuuSvc.displayList$['next']([new Seiyuu({name: 'Maeda Konomi'})]);

        expect(spy2).toHaveBeenCalledWith('test');
        expect(x).toBeFalsy();
        expect(service.pending).toBeFalsy();
      })
  );

});
