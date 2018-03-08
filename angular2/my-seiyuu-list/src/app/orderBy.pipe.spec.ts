import {OrderByPipe} from "./orderBy.pipe";

describe('Pipe: orderByPipe', () => {
  let orderByPipe = new OrderByPipe();

  it('should order an object list', () => {
    expect(JSON.stringify(orderByPipe.transform([{name: '3'}, {name: '1'}, {name: '2'}], ['name'])))
      .toBe(JSON.stringify([{name: '1'}, {name: '2'}, {name: '3'}]));
  });

  it('should order an object list descending', () => {
    expect(JSON.stringify(
      orderByPipe.transform([{name: '3'}, {name: '1'}, {name: '2'}], ['name'], true))
    ).toBe(JSON.stringify([{name: '3'}, {name: '2'}, {name: '1'}]));
  });

  it('should order an object list grouping by main', () => {
    expect(JSON.stringify(orderByPipe.transform(
      [{name: '3', main:true}, {name: '1', main:false}, {name: '2', main:true}, {name: '4', main:false}],
      ['name', 'main']))
    ).toBe(JSON.stringify(
      [{name: '1', main:false}, {name: '4', main:false}, {name: '2', main:true}, {name: '3', main:true}])
    );
  });

});
