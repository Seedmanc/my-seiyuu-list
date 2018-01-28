import { browser, by, element } from 'protractor';

export class RankingPage {
  get() {
    return element(by.css('.ranking-curtain'));
  }
  rankingButton() {
    return element(by.css('.ranking-btn'));
  }

  header() {
    return element(by.css('table.ranking thead tr'));
  }

  tbody() {
    return element(by.css('table.ranking tbody'));
  }

  close() {
    return element(by.css('.ranking-curtain .remove.close'))
  }

  sortNames() {
    return this.header().$('a');
  }
  sortTitles() {
    return this.header().$$('a').get(1);
  }
  sortHits() {
    return this.header().$$('a').get(2);
  }
  sortDates() {
    return this.header().$$('a').get(3);
  }
}
