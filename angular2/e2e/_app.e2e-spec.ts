import { AppPage } from './po/app.po';
import {browser, by, element, protractor} from "protractor";
import {SeiyuuPage} from "./po/seiyuu.po";
import {AnimePage} from "./po/anime.po";
import {PhotosPage} from "./po/photos.po";

describe('my-seiyuu-list App', () => {
  let page: AppPage;
  let seiyuu: SeiyuuPage;
  let EC = protractor.ExpectedConditions;
  const to = 5000;

  beforeEach(() => {
    page = new AppPage();
    AppPage.navigateTo();
    seiyuu = new SeiyuuPage();
  });

  it('should only issue a request to load data when on its page', () => {
    AppPage.navigateTo('#/magazines/578').then(()=> {
      let panel = seiyuu.panel('Maeda Konomi');
      let anime = new AnimePage();

      browser.wait(EC.presenceOf(panel.photo()), to);
      browser.sleep(1000);
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

  it('should only display chart toggle on anime page', () => {
    page.tabs().get(0).click();
    browser.wait(EC.presenceOf(page.toggleChart()), to);
    expect(page.toggleChart().isDisplayed()).toBeTruthy();
    page.tabs().get(1).click();
    expect(page.toggleChart().isPresent()).toBeFalsy();
    page.tabs().get(0).click();
    expect(page.toggleChart().isPresent()).toBeTruthy();
  });

  it('should block chart toggle when under 2 seiyuu selected', () => {
    page.tabs().get(0).click();
    browser.wait(EC.presenceOf(page.toggleChart()), to);
    expect(page.toggleChart().getAttribute("title")).toBeTruthy();

    page.toggleChart().$('label').click().then(
      () => {
        fail("Element should not be clickable for Observer");
      },
      (err) => {
        expect(err.message.toString()).toBeTruthy();
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

  it('should select seiyuu from the suggestion box, hiding the selected ones', () => {
    expect( page.tryLink().count()).toBe(2);
    page.tryLink(1).click();
    let panel = seiyuu.panel('Chihara Minori');
    expect(panel.container.isPresent()).toBeTruthy();
    expect( page.tryLink().count()).toBe(1);
    page.tryLink(1).click();
    expect(seiyuu.panel('Hirano Aya').container.isPresent()).toBeTruthy();
    expect( page.try().isPresent()).toBeFalsy();
  });

  it('should hide the suggestion box and store that state', () => {
    expect( page.try().isPresent()).toBeTruthy();
    page.try().$$('a.remove').click();
    expect( page.try().isPresent()).toBeFalsy();
    AppPage.navigateTo();
    expect( page.try().isPresent()).toBeFalsy();
  });

});
