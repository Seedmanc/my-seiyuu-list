import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RoutingService} from "../_services/routing.service";
import {ActivatedRoute } from "@angular/router";

@Component({
  selector: 'msl-photo-list',
  templateUrl: './photo-list.component.html',
  styleUrls: ['./photo-list.component.css']
})
export class PhotoListComponent implements OnInit {
  photoPage: string;
  pending: boolean = true;

  constructor(private http: HttpClient, private route: ActivatedRoute, private routingSvc: RoutingService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(this.routingSvc.paramMap$);

    this.http.get('https://query.yahooapis.com/v1/public/yql?q=SELECT+*+FROM+htmlstring+WHERE+url+%3D+%27http%3A%2F%2Fkoe.booru.org%2Findex.php%3Fpage%3Dpost%26s%3Dlist%26tags%3Dmizuki_nana%2Bsolo%26pid%3D0%27+AND+xpath+IN+(%27%2F%2Fdiv%5B%40id%3D%22tag_list%22%5D%2F%2Fh5%27%2C%27%2F%2Fdiv%5B%40class+%3D+%22content%22%5D%2F%2Fspan%5B%40class+%3D+%22thumb%22%5D%27)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys')
      .subscribe((result:any) => {
        this.photoPage = result.query.results.result[1].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,'')
          .replace(/class="thumb"/g, 'class="thumb img-thumbnail"');
        this.pending = false;
      })
  }

}
