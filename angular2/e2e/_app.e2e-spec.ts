import { AppPage } from './po/app.po';
import {browser, by, element, protractor} from "protractor";
import {SeiyuuPage} from "./po/seiyuu.po";
import {AnimePage} from "./po/anime.po";
import {PhotosPage} from "./po/photos.po";

describe('my-seiyuu-list App', () => {
  let page: AppPage;
  let EC = protractor.ExpectedConditions;
  const to = 5000;

  beforeEach(() => {
    page = new AppPage();
    AppPage.navigateTo();
  });

  it('should only issue a request to load data when on its page', () => {
    AppPage.navigateTo('#/magazines/578').then(()=> {
      let seiyuu = new SeiyuuPage();
      let photo = new PhotosPage();
      let panel = seiyuu.panel('Maeda Konomi');
      let anime = new AnimePage();

      browser.wait(EC.presenceOf(panel.photo()), to);
      browser.sleep(500);
      browser.manage().logs().get('browser')
        .then(browserLog => {
          expect(browserLog.find(event => !!~event.message.indexOf('Anime requested'))).toBeFalsy();
          expect(browserLog.find(event => !!~event.message.indexOf('Magazines requested'))).toBeTruthy();
        });
      expect(page.statusBar().getText()).toContain('magazines');
      console.log('1 magazine request');

      page.tabs().get(0).click();
      browser.wait(EC.presenceOf(anime.mainOnly()), to);
      browser.manage().logs().get('browser')
        .then(browserLog => {expect(browserLog.find(event => !!~event.message.indexOf('Anime requested'))).toBeTruthy();});
      console.log('1 anime request');
      expect(page.statusBar().getText()).toContain('anime found');

/*      page.tabs().get(2).click();
        browser.wait(EC.presenceOf(photo.thumbContainer()), to);
        browser.manage().logs().get('browser')
          .then(browserLog => {expect(browserLog.find(event => !!~event.message.indexOf('Photos requested'))).toBeTruthy();});
        console.log('1 photo request');
        expect(page.statusBar().getText()).toContain('photo');*/

        page.tabs().get(0).click();
        browser.wait(EC.presenceOf(anime.mainOnly()), to);
        browser.manage().logs().get('browser')
          .then(browserLog => {expect(browserLog.filter(event => !!~event.message.indexOf('Anime requested')).length).toBeFalsy();});
        console.log('no extra anime requests');
        expect(page.statusBar().getText()).toContain('anime found');

        page.tabs().get(1).click();
        browser.wait(EC.presenceOf(element(by.css('#magazines'))), to);
        let name = 'Chihara Minori';
        page.searchInput().sendKeys(name);
        let panel2 = seiyuu.panel(name);
        panel.close().click();
        browser.wait(EC.presenceOf(panel2.photo()), to);
        browser.sleep(500);
        expect(page.statusBar().getText()).toContain('magazines');

        browser.manage().logs().get('browser')
          .then(browserLog => {expect(browserLog.filter(event =>
            !!~event.message.indexOf('Anime requested') || !!~event.message.indexOf('Photos requested')).length).toBeFalsy();});
        console.log('no extra photo or anime requests');

        //page.tabs().get(2).click();
        //browser.wait(EC.presenceOf(photo.thumbContainer()), to);
        //expect(page.statusBar().getText()).toContain('photo');
    });
  });

  it('should display document title', () => {
    browser.getTitle().then(title => {
      expect(title).toBe('My Seiyuu List')
    });
  });

  it('should unlock input, hide spinner and display stats upon loading', () => {
    expect(page.searchInput().isEnabled()).toBeTruthy();
    expect(page.statusBar().getText()).toBeTruthy();
    expect(page.searchSpinner().isPresent()).toBeFalsy();
  });

  it('should toggle disqus when clicked', () => {
    expect(page.disqusContainer().isDisplayed()).toBeFalsy();
    page.toggleDisqus().click();
    browser.wait(EC.visibilityOf(page.disqusContainer()), to);
    expect(page.disqusContainer().$('iframe').isPresent()).toBeTruthy();
    page.toggleDisqus().click();
    expect(page.disqusContainer().isDisplayed()).toBeFalsy();
  });

});
