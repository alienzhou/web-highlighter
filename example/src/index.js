import './index.css';
import Highlighter from '../../dist/highlighter.min.js';

const store = new Highlighter.LocalStore();
const highlighter = new Highlighter();

store.getAll().then(sources => {
    console.log(sources);
    highlighter.init(sources)
});
highlighter.run();

highlighter
    .on(Highlighter.event.CREATE, sources => {
        console.log('create:');
        console.log(sources);
        store.save(sources);
    })
    .on(Highlighter.event.HOVER, id => {
        console.log('hover:');
        console.log(id);
    })
    .on(Highlighter.event.HOVER_OUT, id => {
        console.log('hover out:');
        console.log(id);
    })
    .on(Highlighter.event.INIT, sources => {
        console.log('init:');
        console.log(sources);
    })
    .on(Highlighter.event.REMOVE, ids => {
        console.log('remove:');
        console.log(ids);
        ids.forEach(id => store.remove(id));
    });

const $idInput = document.getElementById('js-highlight-remove-input');
document.getElementById('js-highlight-remove-btn').addEventListener('click', () => {
    const id = $idInput.value;
    highlighter.remove(id);
});

document.getElementById('js-highlight-remove-all-btn').addEventListener('click', () => {
    highlighter.removeAll();
});