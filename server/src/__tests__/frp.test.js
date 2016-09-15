/* eslint-env jest */

import * as frp from '../frp';

test('Streams queue values', () => {
    const s = new frp.Stream();

    s.submit('a');
    s.submit('b');
    s.submit('c');

    expect(s.take()).toBe('a');
    expect(s.take()).toBe('b');
    expect(s.take()).toBe('c');
});
