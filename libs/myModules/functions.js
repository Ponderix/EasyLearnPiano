'use strict';

function getPaths(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].nodeName === "path") return arr; // also returns metadata tags doesnt matter tho
        else if (arr[i].nodeName === "g") return getPaths(arr[i].children);
    }
}

function findParent(element, identifier) {
    if (element.classed(identifier)) {
        return element;
    } else if (element.node().localName == 'body') {
        return null;
    } else {
        let parent = d3.select(element.node().parentElement);
        return findParent(parent, identifier);
    }
}

export {getPaths, findParent};