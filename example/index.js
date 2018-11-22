import './index.css';
import Highlighter from '../src/index';

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