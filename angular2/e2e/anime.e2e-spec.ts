import { protractor, browser, by, element } from "protractor";
import {SeiyuuPage} from "./seiyuu.po";
import {AppPage} from "./app.po";
import {AnimePage} from "./anime.po";

describe('anime lookups', () => {
  let seiyuu: SeiyuuPage;
  let page: AppPage;
  let anime: AnimePage;
  let EC = protractor.ExpectedConditions;
  let cm = 'Chihara Minori';
  let mk = 'Maeda Konomi';
  let ka  = 'Koshimizu Ami';
  let mn  = 'Mizuki Nana';
  let to = 5000;

  beforeEach(() => {
    seiyuu = new SeiyuuPage();
    page = new AppPage();
    anime = new AnimePage();
    AppPage.navigateTo();
    browser.wait(()=>page.statusBar().getText(), to);
  });

  it('should show anime for a single seiyuu, also main', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(mk );
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    expect(seiyuu.panel(mk, false).photo().isPresent()).toBeTruthy();

    expect(anime.tbody('supporting').$$('tr').count()).toBeGreaterThanOrEqual(5);

    anime.mainOnly().click();
    expect(anime.tbody('supporting').$$('tr').count()).toBe(0);
  });

  it('should show anime for multiple seiyuu, switching roles on hover', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(mk );
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    page.searchInput().clear();
    page.searchInput().sendKeys(cm );

    browser.wait(EC.presenceOf( anime.tbody('supporting').$$('tr').get(0)), to);

    expect(anime.tbody('supporting').$$('tr').count()).toBe(2);
    expect(anime.cell(1,2, 'supporting').getText()).toBe('Iwasaki Minami');
    expect(anime.cell(0,2, 'supporting').getText()).toBe('Chihara Minori');
    expect(anime.cell(0,2, 'supporting').$$('.char-list div').count()).toBeGreaterThanOrEqual(2);

    //fucking protractor can't even hover an element, who makes this shit
    seiyuu.panel(mk).container.click();
    expect(anime.cell(1,2, 'supporting').getText()).toBe('Kuroi Nanako');

    seiyuu.panel(cm).close().click();
    expect(anime.tbody('supporting').$$('tr').count()).toBeGreaterThanOrEqual(5);
    seiyuu.panel(mk).close().click();
    expect(anime.tbody('supporting').$$('tr').count()).toBe(0);
    expect(page.statusBar().getText()).toContain('records');
  });

  it('should show anime grouped by role tier and sort', () => {
    page.searchInput().sendKeys(mk.toLowerCase());
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    page.searchInput().clear();
    page.searchInput().sendKeys(cm );
    page.searchInput().clear();
    page.searchInput().sendKeys(ka);
    seiyuu.panel(mk).close().click();


    expect(anime.tbody('main').isPresent()).toBeTruthy();
    expect(anime.rolesTable().$('tbody tr td:nth-child(4)').getText()).toBe('main');
    expect(anime.tbody('main').element(by.cssContainingText('tr td:nth-child(4)', 'supporting')).isPresent()).toBeFalsy();

    anime.mainOnly().click();
    expect(element(by.css('tbody#main')).$$('tr').get(2).isPresent()).toBeTruthy();

    anime.mainOnly().click();
    seiyuu.panel(cm).container.click();

    expect(anime.tbody('supporting').element(by.cssContainingText('tr td:nth-child(4)', 'main')).isPresent()).toBeFalsy();

    anime.tier().click();
    expect(anime.rolesTable().$('tbody tr td:nth-child(4)').getText()).toBe('supporting');

    anime.char().click();
    let l;
      anime.tbody('main').$$('tr').count().then(d => l= d).then(() => {
        anime.cell(0,2).getText().then(first => {
          anime.cell(l-1,2).getText().then(last => {expect(first <= last).toBeTruthy(); return null} )
        })
      });

    anime.char().click();

    anime.tbody('main').$$('tr').count().then(d => l= d).then(() => {
      anime.cell(0,2).getText().then(first => {
        anime.cell(l-1,2).getText().then(last => {expect(first >= last).toBeTruthy(); return null} )
      })
    });

  });

  it('should keep selection when switching tabs', () => {
    page.searchInput().sendKeys(cm );
    page.searchInput().clear();
    page.searchInput().sendKeys(ka);

    expect(anime.tbody('main').$$('tr').count()).toBeGreaterThanOrEqual(6);
    expect(anime.tbody('supporting').$$('tr').count()).toBeGreaterThanOrEqual(6);

    page.tabs().get(1).click();
    expect(element(by.css('msl-magazine-list p')).isPresent()).toBeTruthy();
    page.tabs().get(0).click();
    expect(anime.tbody('main').$$('tr').count()).toBeGreaterThanOrEqual(6);

    page.searchInput().clear();
    page.searchInput().sendKeys(mn);
    expect(anime.tbody('main').$$('tr').count()).toBeGreaterThanOrEqual(1);
  });
});
