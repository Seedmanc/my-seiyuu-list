import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SorterService} from "../_services/sorter.service";

@Component({
  selector: 'msl-sort-link',
  templateUrl: './sort-link.component.html',
  styleUrls: ['./sort-link.component.css']
})
export class SortLinkComponent implements OnInit {
  @ViewChild('content') content;
  @Input() field: string;
  @Input() default;

  constructor(public sorter: SorterService) {  }

  ngOnInit() {
    this.field = this.field || this.content.nativeElement.textContent;

    if (typeof this.default != 'undefined') {
      this.sorter.orderByField = this.field;
    }
  }

  sort() {
    this.sorter.sort(this.field);
  }

}
