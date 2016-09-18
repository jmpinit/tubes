import h from 'virtual-dom/h';

const namespace = 'http://www.w3.org/2000/svg';

function hsvg(elementName, parameters, children) {
    return h(elementName, { ...parameters, namespace }, children);
}

export default hsvg;
