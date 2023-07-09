'use strict';
import {findParent} from '../libs/myModules/functions.js';
import {Filter} from '../libs/myModules/filter.js';
const selected = {id: null}; // for the current selected element

loadItems(d3.select('.results'), selected).then(first => infobox(first));

d3.selectAll('.type__btn').on('click', evt => filterClick(evt));
d3.selectAll('.brand__btn').on('click', evt => filterClick(evt));
d3.select('.filters__search>input').on('input', () => filterClick(null));
d3.select('.slider__slider').on('input', () => filterClick(null));
d3.select('.slider__max').on('input', () => filterClick(null));

async function filterClick(evt) {
    if (evt !== null) {
        let target = d3.select(evt.target);

        if (target.classed('--filters-active')) {
            target.classed('--filters-active', false);
        } else {
            target.classed('--filters-active', true);
        }
    }

    d3.selectAll('.results__element').remove();
    loadItems(d3.select('.results'), selected).then(first => infobox(first));
}

async function loadItems(container, obj) {
    const data = Object.entries(await d3.json('./data/data.json'));
    const search = d3.select('.filters__search>input');

    const slider = d3.select('.slider__slider');
    const max = d3.select('.slider__max');
    const price = d3.select('.slider__price')

    const filter = new Filter(data);

    filter.getActive('type', d3.select('.filters__type')).filter('type');
    filter.getActive('brand', d3.select('.filters__brand')).filter('brand');
    filter.filterSearch(search);
    filter.filterSlider(slider, max, price);

    for (let i = 0; i < data.length; i++) {   
        const element = data[i][1];
        const item =  container.append('div')
            .attr('id', data[i][1].name)
            .attr('class', () => {
                if (i === 0) {
                    return 'results__element --results__element-selected';
                } else {
                    return 'results__element';
                }
            });

        item.append('div')
            .attr('class', 'results__element-img')
            .append('img')
                .attr('src', () => {
                    if (element.img !== null) {
                        return element.img;
                    }
                });
        
        item.append('div')
            .attr('class', 'results__element-info')
            .html(() => {
                let name = element.name;
                let brand = element.brand;
                let price = element.price;

                return `<span>${name}</span><br/>
                ${brand}<br/>
                ${price}
                `;
            });

    }

    obj.id = data[0][1].name;
    d3.selectAll('.results__element')
        .on('click', evt => selectItem(evt, obj)); // bind event to the newly generated items

    return data[0][1].name; // return ID so infobox can be generates
}

async function infobox(id) {
    const container = d3.select('.infobox');
    const data = Object.entries(await d3.json('./data/data.json'));
    let element;

    for (let i = 0; i < data.length; i++) {
        if (data[i][1].name == id) {
            element = data[i][1]
        }
    }
    
    d3.select('.infobox__img').remove();
    d3.select('.infobox__info').remove();

    container.append('div')
        .attr('class', 'infobox__img')
        .append('img')
            .attr('src', () => {
                if (element.img !== null) {
                    return element.img;
                }
            });
    
    container.append('div')
        .attr('class', 'infobox__info')
        .html(`
            <strong>Price:</strong> ${element.price}<br/>
            <strong>Type:</strong> ${element.specs.type}<br/>
            <strong>Pedaling:</strong> ${element.specs.pedaling}<br/>
            <strong>Keys:</strong> ${element.specs.keys}<br/><br/>
            <strong>Purchase:</strong> <a href="${element.specs.link}">${element.specs.link}</a> <br/><br/>
            ${element.specs.info}<br/>
        `)
}

function selectItem(evt, obj) {
    const target = findParent(d3.select(evt.target), 'results__element');
    const target_id = target.attr('id');
    const current = d3.select(`#${obj.id}`);

    current.classed('--results__element-selected', false);
    target.classed('--results__element-selected', true);
    infobox(target_id);

    return obj.id = target_id;
}