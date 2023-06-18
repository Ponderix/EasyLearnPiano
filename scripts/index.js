'use strict';
import {Staff} from '../libs/myModules/staff.js';

const input_field = d3.select('.game__input');
let staff;

d3.select(window)
    .on('load', () => {
        staff = new Staff(d3.select('.game__staff'), d3.select('.game__timer'), d3.select('.game__results'), 'treble', 110);
        drawStaff(staff);
    });
d3.select('.game__reset')
    .on('click', () => {
        let treble = d3.select('.clef-btns__treble');
        let bass = d3.select('.clef-btns__bass');
        switchClass(treble, bass, '--game__btn-selected');

        staff.delete()
        staff = new Staff(d3.select('.game__staff'), d3.select('.game__timer'), d3.select('.game__results'), 'treble', 110);
        drawStaff(staff);
    })

d3.select('.clef-btns__treble').on('click', (evt) => {
    let treble = d3.select(evt.target);
    let bass = d3.select('.clef-btns__bass');
    switchClass(treble, bass, '--game__btn-selected');

    staff.delete()
    staff = new Staff(d3.select('.game__staff'), d3.select('.game__timer'), d3.select('.game__results'), 'treble', 110);
    drawStaff(staff);
})
d3.select('.clef-btns__bass').on('click', (evt) => {
    let bass = d3.select(evt.target);
    let treble = d3.select('.clef-btns__treble');
    switchClass(bass, treble, '--game__btn-selected');

    staff.delete()
    staff = new Staff(d3.select('.game__staff'), d3.select('.game__timer'), d3.select('.game__results'), 'bass', 110);
    drawStaff(staff);
})

input_field.on('input', (evt) => { 
    evt.target.readOnly = true;
    submitNote(evt.target.value, staff);

    setTimeout(() => {
        evt.target.value = null;
        evt.target.readOnly = false;
    }, 250);
});

function switchClass(target, btn2, classStr) {
    switch (target.classed(classStr)) {
        case true:
            return null;
        case false:
            target.classed(classStr, true);
            btn2.classed(classStr, false);
    }
}

function drawStaff(instance) {
    instance.draw()
        .then(instance.drawSignature())
        .then(instance.generateNotes())
}

function submitNote(input, instance) {
    const pointer = instance.pointer;
    const element = instance.svg.select('.staff__notes').node().children[pointer.current]; // the corresponding element of the current note
    const note = instance.notes[pointer.current];

    input = input.toUpperCase();

    if (instance.timer_container.node().innerHTML === '') {
        instance.startTimer();
    }

    if (pointer.current > instance.notes.length-1) { // instance.notes.length-1
        return null;
    } else if (pointer.current === pointer.prev) {
        if (note.includes(input)) {
            element.style.fill = 'goldenrod';
            element.style.stroke = 'goldenrod';

            pointer.partial+=1;
            pointer.current+=1;

            if (pointer.current-1 === instance.notes.length-1) {
                instance.stopTimer();
                instance.postResults();
            }
        } else {
            element.style.fill = 'red';
            element.style.stroke = 'red';

            pointer.wrong+=1;
            pointer.current+=1;

            if (pointer.current-1 === instance.notes.length-1) {
                instance.stopTimer();
                instance.postResults();
            }
        }
    } else {
        if (note.includes(input)) {
            element.style.fill = 'green';
            element.style.stroke = 'green';

            pointer.correct+=1;
            pointer.current+=1;
            pointer.prev+=1;

            if (pointer.current-1 === instance.notes.length-1) {
                instance.stopTimer();
                instance.postResults();
            }
        } else {
            pointer.prev+=1;
        }
    }

} 
 
 
 
 
 
 
 