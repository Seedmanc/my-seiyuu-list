import {Anime} from "../anime.model";

const sampleData = {
  _id: 123,
   rolesBySeiyuu: {
    "53": [
    {
      "name": "Chihara Minori",
      "main": false,
      "_id": 53
    }, {
      "name": "Iwasaki&star;Minami",
      "main": true,
      "_id": 53
    }
  ], "578": [
    {
      "name": "Kuroi Nanako",
      "main": false,
      "_id": 578
    }]
  }
};

fdescribe('Anime model', () => {
  it('should have working getters without activeSeiyuu or cache', () => {
    let anime = new Anime(sampleData);

    expect(anime.title).toBe('123');
    expect(anime.thumb).toBe('');
    expect(anime.link).toBe('//myanimelist.net/anime/123');
  });

  it('should have working getters with cache', () => {
    let anime = new Anime(sampleData);

    Anime.detailsCache = {
      123: {
        title: 'Lucky Star',
        pic: '/images/anime/10/76288.jpg'
      }
    };

    expect(anime.title).toBe('Lucky Star');
    expect(anime.thumb).toBe('//myanimelist.net/images/anime/10/76288v.jpg');
  });

  it('should react to activeSeiyuu change', () => {
    let anime = new Anime(sampleData);

    Anime.activeSeiyuu = 53;

    expect(anime.main).toBeTruthy();
    expect(JSON.stringify(anime.characters)).toBe(JSON.stringify([
      {
        "name": "Iwasaki☆Minami",
        "main": true
      },
      {
        "name": "Chihara Minori",
        "main": false
      }
    ]));
    expect(anime.mainCharacter).toBe('Iwasaki☆Minami');

    Anime.activeSeiyuu = 578;

    expect(anime.main).toBeFalsy();
    expect(JSON.stringify(anime.characters)).toBe(JSON.stringify([
      {
        "name": "Kuroi Nanako",
        "main": false
      }
    ]));

  });

});
