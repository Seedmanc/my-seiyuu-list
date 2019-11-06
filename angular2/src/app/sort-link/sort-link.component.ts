import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
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
  @Input() fixed;

  @Output() onSort = new EventEmitter();

  constructor(public sorter: SorterService) {  }

  ngOnInit() {
    this.fixed = (typeof this.fixed != 'undefined');
    this.field = this.field || this.content.nativeElement.textContent;

    if (this.fixed) {
      this.sorter.fixed = this.field;
    }
    if (typeof this.default != 'undefined')
        this.sort();
  }

  sort() {
    if (!this.fixed)
      this.sorter.sort(this.field);
    this.onSort.next(this.sorter.ascending);
  }

}
