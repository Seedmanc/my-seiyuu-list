import { browser, by, element } from 'protractor';

export class PhotoPage {
  static navigateTo() {
    return browser.get('/#/photos/0');
  }

  thumbContainer() {
    return element(by.css('#thumbContainer'));
  }

  spinner() {
    return element(by.css('#photos-spinner > msl-spinner'));
  }

  thumbs() {
    return element(by.css('#thumbContainer')).$$('span.thumb');
  }

  next() {
    return element(by.css('#next'));
  }
  prev() {
    return element(by.css('#prev'));
  }
  page() {
    return element(by.css('#nav .page'));
  }

  more() {
    return element(by.css('span.thumb.more a'));
  }
}
