import { browser, by, element } from 'protractor';

export class SeiyuuPage {
  static navigateTo() {
    return browser.get('/');
  }

  containers() {
    return element.all(by.css('.seiyuu'));
  }

  panel(name: string, namesake?:boolean) {
    let result:any = {
      container: element(by.cssContainingText(`.seiyuu${namesake ? '.namesake':':not(.namesake)'}`, name))
    };
    result.photo = () => result.container.$('.vapic');
    result.close = () => result.container.$('.close');
    result.picks = () => result.container.$$('.pick');

    return result;
  }

}
