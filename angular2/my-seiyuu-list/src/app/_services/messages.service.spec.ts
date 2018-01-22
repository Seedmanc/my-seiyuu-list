import {TestBed, inject, fakeAsync, tick, async} from '@angular/core/testing';

import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessagesService]
    });
  });

  it('should be created', inject([MessagesService], (service: MessagesService) => {
    expect(service).toBeTruthy();
  }));

  it('should emit an error upon such method', fakeAsync(
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);

      service.error('error');
      tick();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: true, data: 'error'}));
    })
  ));
  it('should emit a status upon such method', fakeAsync(
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);

      service.status('status');
      tick();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({isError: false, data: 'status'}));
    })
  ));
  it('should emit a blank upon such method', fakeAsync(
    inject([MessagesService], (service:MessagesService) => {
      let x;
      service.message$.subscribe(data => x=data);
      service.status('status');
      service.blank();
      tick();
      expect(JSON.stringify(x)).toEqual(JSON.stringify({}));
    })
  ));
});
