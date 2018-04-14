import {BasicSeiyuu, Seiyuu} from "../seiyuu.model";

export const date = new Date();
export const model = {
  "_id": 578,
  "name": "Maeda Konomi",
  "count": 5,
  "hits": 2,
  "alternate_name": ["前田このみ"],
  "updated": "Sun, 25 Oct 2015 10:02:56 GMT",
  "accessed": +date,
  "pic": "/images/voiceactors/3/33867.jpg",
  "roles": [
    {
      "name": "Pierre",
      "main": false,
      "_id": 2829
    }
  ]
};
export const basicModel = {
  "_id": 578,
  "name": "Maeda Konomi",
  "count": 5,
  "hits": 2,
  "alternate_name": ["前田このみ"],
  "updated": "Sun, 25 Oct 2015 10:02:56 GMT",
  "accessed": +date
};
export const basicModel2 = {
  "_id": 0,
  "name": "Test Name",
  "count": 1,
  "hits": 2,
  "alternate_name": [],
  "updated": "Sun, 25 Oct 2015 10:02:56 GMT",
  "accessed": +date
};
export const model2 = Object.assign({}, basicModel2, {
  "pic": "/images/voiceactors/3/33867.jpg",
  "alternate_name": [],
  "roles": [
    {
      "name": "Pierre",
      "main": false,
      "_id": 2829
    }
  ]
});

describe('Seiyuu model', () => {
  it('should create BasicSeiyuu',()=>{
    expect(new BasicSeiyuu(basicModel)).toBeTruthy();
  });
  it('should format date upon creation', ()=>{
    expect(JSON.stringify(new BasicSeiyuu(basicModel).accessed)).toBe(JSON.stringify(date));
    expect(JSON.stringify(new BasicSeiyuu(basicModel).updated)).toBe(JSON.stringify(new Date("Sun, 25 Oct 2015 10:02:56 GMT")));
  });
  it('should require upgrade when basic unless with namesakes', ()=>{
    expect((new BasicSeiyuu(basicModel)).pending).toBeTruthy();
    expect((new Seiyuu(model)).pending).toBeFalsy();
  });
  it('should upgrade from basic to full', ()=>{
    let upgraded = (new BasicSeiyuu(basicModel)).upgrade(model);
    let full:Seiyuu = new Seiyuu(model);

    expect(JSON.stringify(upgraded)).toBe(JSON.stringify(new Seiyuu(model)));
    expect(upgraded.link).toBe('//myanimelist.net/people/578');
    expect(full['photo']).toBe('//myanimelist.net/images/voiceactors/3/33867.jpg');
    expect(full['thumb']).toBe('//myanimelist.net/images/voiceactors/3/33867v.jpg');
  });

});
