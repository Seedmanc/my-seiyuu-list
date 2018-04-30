import { browser, by, element } from 'protractor';

export class PhotoPage {
  static navigateTo() {
    return browser.get('/#/photos/0');
  }

  thumbContainer() {
    return element(by.css('#thumbContainer'));
  }

  spinner() {
    return element(by.css('#thumbContainer > msl-spinner'));
  }

  thumbs() {
    return element(by.css('#thumbContainer')).$$('span.thumb');
  }
}
