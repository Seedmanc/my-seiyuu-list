import { AppPage } from './app.po';
import {RankingPage} from "./ranking.po";

describe('ranking', () => {
  let page: RankingPage, tbody;

  beforeAll(() => {
    page = new RankingPage();
    AppPage.navigateTo();

    page.rankingButton().click();
    tbody = page.tbody();
  });

  it('should show ranking upon click', () =>{
    expect(page.get().isPresent()).toBeTruthy();
    expect(tbody.$$('tr').count()).toBeGreaterThanOrEqual(7);
    expect(tbody.$('tr').$('td').getText()).toBeTruthy();
    expect(tbody.$('tr').$$('td').get(1).getText()).not.toBeNaN();
    expect(tbody.$('tr').$$('td').get(2).getText()).not.toBeNaN();
    expect(tbody.$('tr').$$('td').get(3).getText()).toBeTruthy();
  });

  it('should sort ranking upon header click on name or titles', () =>{
    let last = tbody.$$('tr').last().$('td').getText();
    expect(last).toBeTruthy();

    page.sortNames().click();
    expect(page.tbody().$$('tr').first().$('td').getText()).toBe(last);

    page.sortTitles().click();
    last = tbody.$$('tr').last().$$('td').get(1).getText() ;
    page.tbody().$$('tr').first().$$('td').get(1).getText().then(el=>{expect(parseInt(el)).toBeLessThanOrEqual(last)});
  });
  it('should sort ranking upon header click on hits', () =>{
    let last = tbody.$$('tr').last().$$('td').get(2).getText();
    expect(last).toBeTruthy();

    page.sortHits().click();
    expect(page.tbody().$$('tr').first().$$('td').get(2).getText()).toBeGreaterThanOrEqual(last);
  });
  it('should sort ranking upon header click on date', () =>{
    let last = tbody.$$('tr').last().$$('td').get(3).getAttribute('data-date');
    expect(last).toBeTruthy();

    page.sortDates().click();
    page.tbody().$$('tr').first().$$('td').get(3).getAttribute('data-date')
      .then(el => {expect(el).toBeGreaterThanOrEqual(last)});
  });

  it('should close ranking by [x]', ()=>{
    page.close().click();
    expect(page.get().isPresent()).toBeFalsy();
  })
});
