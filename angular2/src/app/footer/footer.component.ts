import {Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {RankingComponent} from "../ranking/ranking.component";
import {SeiyuuService} from "../_services/seiyuu.service";

@Component({
  selector: 'msl-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  @ViewChild(RankingComponent) mslRanking: RankingComponent;

  disqusVisible: boolean;

  constructor(public seiyuuSvc: SeiyuuService,
              private el: ElementRef,
              private renderer: Renderer2) { }

  toggleDisqus() {
    this.disqusVisible = !this.disqusVisible;

    if (window['DISQUS']) return;

    const script = this.renderer.createElement('script');
    script.src = `//my-seiyuu-list.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());

    this.el.nativeElement.appendChild(script);
  }
}
