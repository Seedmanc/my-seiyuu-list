import { browser, by, element } from 'protractor';

export class AnimePage {
  static navigateTo() {
    return browser.get('/#/anime/0');
  }

  rolesTable() {
    return element(by.css('#rolesTable'));
  }

  tbody(tier) {
    return this.rolesTable().$('tbody#'+tier)
  }

  cell(tr, td, tier='main') {
    return this.tbody(tier).$$('tr').get(tr).$$('td').get(td);
  }

  mainOnly() {
    return element(by.css('#mainOnly'));
  }

  tier() {
    return element(by.css('.tier a'));
  }

  char() {
    return element(by.css('.char a'));
  }

  inactive() {
    return element(by.css('.inactive'));
  }
}
