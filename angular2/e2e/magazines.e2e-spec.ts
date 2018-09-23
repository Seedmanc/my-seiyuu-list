import {browser, by, element, protractor} from "protractor";
import {AppPage} from "./po/app.po";
import {SeiyuuPage} from "./po/seiyuu.po";
import {MagazinePage} from "./po/magazines.po";

describe('magazine lookups', () => {
  let page: MagazinePage;
  let app: AppPage;
  let seiyuu: SeiyuuPage;
  let EC = protractor.ExpectedConditions;
  let to = 5000;

  beforeEach(() => {
    page = new MagazinePage();
    app = new AppPage();
    seiyuu = new SeiyuuPage();
    MagazinePage.navigateTo();
  });

  it('should load magazine when a seiyuu is selected from magazine page', () => {
    AppPage.navigateTo('#/magazines/53');
    let panel = seiyuu.panel('Chihara Minori');

    browser.wait(EC.presenceOf(page.spinner()), to);
    browser.wait(EC.presenceOf(element(by.css('#magazines'))), to);

    expect(page.magazines().isPresent()).toBeTruthy();
    expect(app.statusBar().getText()).toContain('issues');

    browser.wait(EC.presenceOf(page.magazine('hm3_special').container), to);
    let magazine = page.magazine('hm3_special');
    expect(magazine.container.isPresent()).toBeTruthy();
    expect(magazine.issues.count()).toBeTruthy();
    expect(magazine.issues.get(0).$$('.seiyuu').count()).toBeTruthy();
    expect(magazine.container.$('img[src*="hm3_special"]').isPresent()).toBeTruthy();
    expect(magazine.selected.isPresent()).toBeTruthy();
    expect(magazine.selected.getText()).toBe('Chihara Minori');
  });

  it('should update list as seiyuu are added and removed', () => {
    let name = 'Chihara Minori';
    app.searchInput().sendKeys(name);

    browser.wait(EC.presenceOf(page.magazine('hm3_special').container), to);
    let x = element(by.css('#magazines')).$$('.issue-row').count();

    x.then(xx => {expect(app.statusBar().getText()).toContain(`${xx} issues `);});

    let name2 = 'Koshimizu Ami';
    app.searchInput().clear();
    app.searchInput().sendKeys(name2);

    browser.wait(EC.presenceOf(page.magazine('hm3_special').container), to);
    x.then(x => { element(by.css('#magazines')).$$('.issue-row').count().then(c => {expect(c).toBeLessThan(x);})});
  });

  it('should show when no magazines are found', () => {
    AppPage.navigateTo('#/magazines/53,578');

    browser.wait(EC.presenceOf(page.spinner()), to);
    browser.wait(EC.presenceOf(element(by.css('#magazines'))), to);
    expect(app.statusBar().getText()).toContain(`no magazines found`);
  });

});
