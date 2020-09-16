import {Utils} from "../utils";

describe('Utils', () => {

  it('should make a simple numeric list unique', ()=>{
    expect(JSON.stringify(Utils.unique([3,1,5,6,5,0])))
      .toBe(JSON.stringify([3,1,5,6,0]));
  });
  it('should make a complex object list unique by a property', ()=>{
    expect(JSON.stringify(Utils.unique([{id:3},{id:1},{id:5},{id:6},{id:5},{id:0}], 'id')))
      .toBe(JSON.stringify([{id:3},{id:1},{id:5},{id:6},{id:0}]));
  });

  it('should return "s" for plural input', ()=>{
    expect(Utils.pluralize(5)).toBe('s');
  });
  it('should return "s" for plural input ending with 0', ()=>{
    expect(Utils.pluralize(20)).toBe('s');
  });
  it('should return "s" for 0', ()=>{
    expect(Utils.pluralize(0)).toBe('s');
  });
  it('should not return "s" for singular input', ()=>{
    expect(Utils.pluralize(1)).toBe('');
  });
  it('should not return "s" for plural input ending with 1', ()=>{
    expect(Utils.pluralize(21)).toBe('');
  });

  it('should choose proper order among 2 versions of space-delimited lists of words if they\'re same',
    ()=> expect(Utils.unorderedCompare('first second third', 'Third Second First'))
      .toBe('third second first')
  );
  it('should be falsy if the lists are different',
    ()=> expect(Utils.unorderedCompare('first second third', 'third second first fourth'))
      .toBeFalsy()
  );

  it('should find a kanji name in the list', () =>
    expect(Utils.kanjiCompare('茅原 実里', ['茅原実里'])).toBeTruthy()
  );
});
