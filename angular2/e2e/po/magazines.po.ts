import { browser, by, element } from 'protractor';

export class MagazinePage {
  static navigateTo() {
    return browser.get('/#/magazines/0');
  }

  thumbContainer() {
    return element(by.css('#thumbContainer'));
  }

  spinner() {
    return element(by.css('#magazines-spinner > msl-spinner'));
  }

  magazines() {
    return element(by.css('.magazine'));
  }

  magazine(type) {
    return {
      container: element(by.css('#'+type)),
      issues: element(by.css('#'+type)).$$('.issue-row'),
      selected: element(by.css('#'+type + ' .selected'))
    }
  }


}
