'use strict'
import {getPaths} from './functions.js';

export class Staff {
    constructor(container, timer_container, results_container, clef, height) {
        this.container = container;
        this.timer_container = timer_container;
        this.results_container = results_container;
        this.clef = clef;
        this.height = height;
        this.width = container.node().offsetWidth;
        this.svg = container.append('svg')
            .attr('class', 'staff__svg')
            .attr('width', `${this.width}px`)
            .attr('height', `${height}px`);

        this.notes = null;
        this.pointer = {
            correct: 0,
            wrong: 0,
            partial: 0,
            current: 0,
            prev: -1
        }

        this.timer = null
    }

    async draw() {
        const svg = this.svg;
        const width = this.width;
        const height = this.height;
        const clef = this.clef;

        function calcLineSeperation(index) {
            let seperation = (height-10) / 10;
            let margin = (3 * height / 10) + 5;
            return margin + index * seperation;
        }

        // staff lines
        const lines = svg.append('g').attr('class', 'staff__lines');
        for (let i = 0; i < 5; i++) {
            lines.append('line')
                .style('stroke', 'black')
                .style('stroke-width', '1px')
                .attr('x1', '0')
                .attr('y1', calcLineSeperation(i))
                .attr('x2', width)
                .attr('y2', calcLineSeperation(i));
        }

        // staff clef
        const data = await d3.xml(`assets/clefs/${clef}.svg`);
        const paths = getPaths(data.documentElement.children);

        let scale;
        let translate = 'translate(0 61)'; // 31 to account for 1px line width
        if (clef === 'treble') {
            scale = 0.31;
        } else if (clef === 'bass') {
            scale = 0.29;
        }

        svg.append('g')
            .attr('transform', `scale(${scale})`)
            .attr('class', 'staff__clef')
                .selectAll('path')
                .data(paths)
                .enter().append('path')
                    .attr('d', node => node.getAttribute('d'))
                    .attr('transform', translate)
                    .attr('stroke-width', node => node.getAttribute('stroke-width'));
    
        return this; // enables function chaining
    }

    async drawSignature() {
        const svg = this.svg;

        const data = await d3.xml(`assets/signature.svg`);
        const paths = getPaths(data.documentElement.children);

        svg.append('g')
            .attr('class', 'staff_signature')
            .attr('transform', 'scale(0.85) translate(45, 40)')
            .selectAll('path')
                .data(paths)
                .enter().append('path')
                    .attr('d', node => node.getAttribute('d'));

        return this;
    }

    async generateNotes() {
        const svg = this.svg;
        const width = this.width;
        const clef = this.clef;

        const treble = ['G5','F5','E5','D5','C5','B4','A4','G4','F4','E4','D4'];
        const bass = ['B3','A3','G3','F3','E3','D3','C3','B2','A2','G2','F2'];
        
        const types = [
            {name: 'eigth', path: 'assets/notes/eigth.svg', value: 1.25},
            {name: 'quarter', path: 'assets/notes/quarter.svg', value: 1.5},
            {name: 'half', path: 'assets/notes/half.svg', value: 1.75}, 
        ]

        const output = []; // array of notes in order from left to right 
        const beat_width = 30;
        const beats = Math.floor(
            (width - 70) / beat_width
        ) // number of quarter note beats in the bar (equivalent to NUM on the flowcharts)

        const g = svg.append('g')
            .attr('class', 'staff__notes');
        
        var left_bound = 70;
        for (let i = 0; i < beats - 1;) { // minus 1 ensures that theres always a 1 beat margin on the right
            let type = d3.randomInt(3)();
            let note = d3.randomInt(11)();

            const data = await d3.xml(types[type].path);
            const paths = getPaths(data.documentElement.children);
            
            g.append('g')
                .attr('class', () => {
                    if (clef === 'treble') {
                        output.push(treble[note]);
                        return treble[note];
                    } else if (clef === 'bass') {
                        output.push(bass[note]);
                        return bass[note];
                    }
                })
                .attr('transform', () => {
                    let x = left_bound;
                    let y = 2 + note * 5;

                    left_bound = left_bound + (types[type].value * beat_width); // update it after for the next note

                    return `translate(${x}, ${y}) scale(${0.40})`
                })
                .selectAll('path')
                    .data(paths)
                    .enter().append('path')
                        .attr('d', node => node.getAttribute('d'));

            i = i + types[type].value;
        }

        this.notes = output;
    }

    delete() {
        this.svg.remove();
        this.stopTimer();
        this.timer_container.html('');
        this.results_container.html('');
        return this;
    }

    startTimer() {
        let time = 0;
        let increment = 10;

        this.timer = setInterval(() => {
            let update = (time+=increment) / 1000;
            this.timer_container.html(update + 's');
        }, increment)

        return this;
    }

    stopTimer() {
        if (this.timer !== undefined) {
            clearInterval(this.timer);
        }

        return this;
    }

    calcPercent(a, b) {
        return Math.round((a / b) * 100);
    }

    postResults() {
        this.results_container.html(() => {
            let pointer = this.pointer;
            let length = this.notes.length;
    
            return `RESULT<br/>
            Correct: ${pointer.correct}/${length} (${this.calcPercent(pointer.correct, length)}%)<br/>
            Partial (second try): ${pointer.partial}/${length} (${this.calcPercent(pointer.partial, length)}%)<br/>
            Wrong: ${pointer.wrong}/${length} (${this.calcPercent(pointer.wrong, length)}%)
            `
        })
    }
}