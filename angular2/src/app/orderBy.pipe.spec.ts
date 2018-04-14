import {OrderByPipe} from "./orderBy.pipe";

describe('Pipe: orderByPipe', () => {
  let orderByPipe = new OrderByPipe();

  it('should order an object list', () => {
    expect(JSON.stringify(orderByPipe.transform([{name: '3'}, {name: '1'}, {name: '2'}], ['name'])))
      .toBe(JSON.stringify([{name: '3'}, {name: '2'}, {name: '1'}]));
  });

  it('should order an object list descending', () => {
    expect(JSON.stringify(
      orderByPipe.transform([{name: '3'}, {name: '1'}, {name: '2'}], ['name'], false))
    ).toBe(JSON.stringify([{name: '3'}, {name: '2'}, {name: '1'}]));
  });

});
