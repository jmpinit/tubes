// @flow
/* eslint-env jest */

import * as frp from '../frp';

function checkValues(node, values) {
    const output = node.output();

    return new Promise((fulfill) => {
        let i = 0;

        output.on('message', () => {
            expect(node.output().take()).toBe(values[i]);

            i += 1;

            if (i >= values.length) {
                fulfill();
            }
        });
    });
}

test('Streams queue values', () => {
    const s = new frp.Stream();

    s.submit('a');
    s.submit('b');
    s.submit('c');

    expect(s.take()).toBe('a');
    expect(s.take()).toBe('b');
    expect(s.take()).toBe('c');
});

test('Lift creates values by applying a function to its inputs', () => {
    const input = new frp.Input();
    const liftSquare = new frp.Lift([input.output()], v => v * v);

    const values = [1, 2, 3];
    const checkPromise = checkValues(liftSquare, values.map(v => v * v));
    values.forEach(v => input.submit(v));

    return checkPromise;
});

test('FoldP creates values by applying a function to its inputs and the previous state', () => {
    const input = new frp.Input();
    const sumFold = new frp.FoldP(input.output(), 0, (p, v) => p + v);

    const values = [1, 2, 3];
    const checkPromise = checkValues(sumFold, [1, 3, 6]);
    values.forEach(v => input.submit(v));

    return checkPromise;
});

test('Let labels streams so they can be reused', () => {
    const input = new frp.Input();
    const letX = new frp.Let(input.output());

    const add1 = v => v + 1;
    const liftAdd1 = new frp.Lift([letX.output()], add1);

    const square = v => v * v;
    const liftSquare = new frp.Lift([letX.output()], square);

    const values = [1, 2, 3];
    const checkAdd = checkValues(liftAdd1, values.map(add1));
    const checkSquare = checkValues(liftSquare, values.map(square));

    const checkPromise = Promise.all([checkAdd, checkSquare]);

    values.forEach(v => input.submit(v));

    return checkPromise;
});
