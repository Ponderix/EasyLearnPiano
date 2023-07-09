'use strict';

export class Filter {
    constructor(array) {
        this.array = array;
        this.type = null;
        this.brand = null;
        this.elementsInclude = function (arr, string) {
            for (let i = 0; i < arr.length; i++) {
                let reference = arr[i].toLowerCase()
                if (reference.includes(string)) {
                    return true;
                }
            }
        }
    }

    getActive(setting, selection) {
        const collection = selection.selectAll('div').nodes();
        const output = [];
        const remove = [];

        for (let i = 0; i < collection.length; i++) {
            if (collection[i].classList.contains('--filters-active') === false) {
                remove.push(i);
            }
        }
        for (const i of remove.reverse()) { // reverse so it doesnt mess up the order
            collection.splice(i, 1)
        }

        for (let i = 0; i < collection.length; i++) {
            output.push(collection[i].textContent)
        }

        this[setting] = output;
        return this;
    }

    filter(setting) {
        const data = this.array;
        const params = this[setting];
        const remove = [];
        
        for (let i = 0; i < data.length; i++) {
            let match = false;
            let element = data[i][1];

            for (let j = 0; j < params.length; j++) {
                if (setting === 'type') {
                    if (element.specs.type === params[j]) {
                        match = true;
                    }
                } else if (setting === 'brand') {
                    if (element.brand === params[j]) {
                        match = true;
                    }
                }
            }
    
            if (match === false) {
                remove.push(i);
            }
        }
        for (const i of remove.reverse()) { // reverse so it doesnt mess up the order
            data.splice(i, 1);
        }
    }

    filterSearch(selection) {
        const query = selection.node().value.toLowerCase();
        const data = this.array;
        const remove = [];
        if (query === '') {
            return null;
        }

        for (let i = 0; i < data.length; i++) {
            let match = false;
            let element = data[i][1];

            let general_arr = Object.values(element)
            let specs_arr = Object.values(general_arr[4]) // order matters since this is post removal
            general_arr.splice(4, 1) // remove obj
            general_arr.splice(3, 1) // remove price
            general_arr.splice(1, 1) // remove img link
            
            if (this.elementsInclude(general_arr, query) || this.elementsInclude(specs_arr, query)) {
                match = true;
            }
            
            if (match === false) {
                remove.push(i);
            }
        }

        for (const i of remove.reverse()) { // reverse so it doesnt mess up the order
            data.splice(i, 1);
        }
    }

    filterSlider(selection, input, output) {
        const value = selection.node().value;
        const data = this.array;
        const remove = [];

        let bound = Number(input.node().value);
        if (isNaN(bound) || bound === 0) {
            bound = Infinity;
        }
        let max = Math.floor((value / 100) * bound);
        output.html('€' + max.toLocaleString());

        for (let i = 0; i < data.length; i++) {
            let element = data[i][1];
            let price = element.price.replace(',', '').replace('€', '');
            
            if (Number(price) > max) {
                remove.push(i)
            }
        }
        for (const i of remove.reverse()) { // reverse so it doesnt mess up the order
            data.splice(i, 1);
        }
    }
}