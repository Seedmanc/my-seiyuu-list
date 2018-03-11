import { protractor, browser } from "protractor";
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
  let km  = 'Koshimizu Ami';
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
    page.searchInput().sendKeys(mk.toLowerCase());
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    expect(seiyuu.panel(mk, false).photo().isPresent()).toBeTruthy();

    expect(anime.tbody('supporting').$$('tr').count()).toBe(5);

    anime.mainOnly().click();
    expect(anime.tbody('supporting').$$('tr').count()).toBe(0);
  });

  it('should show anime for multiple seiyuu, switching roles on hover', () => {
    expect(seiyuu.containers().count()).toBeFalsy();
    page.searchInput().sendKeys(mk.toLowerCase());
    let panel = seiyuu.panel(mk, true);
    browser.wait(EC.presenceOf( panel.picks().get(0)), to);
    panel.picks().get(0).click();
    page.searchInput().clear();
    page.searchInput().sendKeys(cm.toLowerCase());

    browser.wait(EC.presenceOf( anime.tbody('supporting').$$('tr').get(0)), to);

    expect(anime.tbody('supporting').$$('tr').count()).toBe(2);
    expect(anime.cell(1,2, 'supporting').getText()).toBe('Iwasaki Minami');
    expect(anime.cell(0,2, 'supporting').getText()).toBe('Chihara Minori');
    expect(anime.cell(0,2, 'supporting').$$('.char-list div').count()).toBe(2);

    //fucking protractor can't even hover an element, who makes this shit
    seiyuu.panel(mk).container.click();
    expect(anime.cell(1,2, 'supporting').getText()).toBe('Kuroi Nanako');
  });
});
