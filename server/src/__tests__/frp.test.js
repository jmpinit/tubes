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

test('Lift applies a function to values in a stream', () => {
    const input = new frp.Input();

    // TODO eventually enforce the type of v
    // it needs to be a number
    const liftSquare = new frp.Lift(input.output, v => v * v);

    const values = [1, 2, 3];

    const checkPromise = new Promise((fulfill) => {
        let i = 0;

        liftSquare.output.on('message', () => {
            expect(liftSquare.output.take()).toBe(values[i] * values[i]);

            i += 1;

            if (i >= values.length) {
                fulfill();
            }
        });
    });

    values.forEach(v => input.submit(v));

    return checkPromise;
});
