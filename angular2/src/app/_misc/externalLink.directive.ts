import {Directive, HostBinding} from "@angular/core";

@Directive({
  selector: 'a:not([routerLink])'     // look at me being fancy and all
})
export class ExternalLinkDirective {
  @HostBinding('rel') public rel = 'noopener';
  @HostBinding('target') target = '_blank';
}
