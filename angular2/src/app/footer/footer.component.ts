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

  constructor(private el: ElementRef, private renderer: Renderer2, public seiyuuSvc: SeiyuuService) { }

  toggleDisqus() {
    this.disqusVisible = !this.disqusVisible;

    if (this.disqusVisible)
      setTimeout(() => window.scrollTo(0,document.body.scrollHeight), 250);
    if (window['DISQUS']) return;

    const script = this.renderer.createElement('script');
    script.src = `//my-seiyuu-list.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());

    this.el.nativeElement.appendChild(script);
  }
}
