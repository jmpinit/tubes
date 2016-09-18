let counter = 0;

function uid() {
    const id = counter.toString();
    counter += 1;
    return id;
}

export default uid;
