import {Component, ElementRef, OnInit, Renderer2} from '@angular/core';

@Component({
  selector: 'msl-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  disqusVisible: boolean = true;

  constructor(private el:ElementRef, private renderer:Renderer2) { }

  ngOnInit() {
  }

  toggleDisqus() {
    if (window['DISQUS']) {
      this.disqusVisible = !this.disqusVisible;
      return;
    }

    let script = this.renderer.createElement('script');
    script.src = `//my-seiyuu-list.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());

    this.el.nativeElement.appendChild(script);
  }

  showRanking() {
  }
}
