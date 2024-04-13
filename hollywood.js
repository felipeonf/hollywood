/**
* Larger problem is decomposed into entities using some form of abstraction
(objects, modules, or similar).
The entities are never called on directly for actions.
The entities provide interfaces for other entities to be able to register
callbacks.
At certain points of the computation, the entities call on the other entities
that have registered for callbacks.
 * */ 

const fs = require('fs')
const path = require('path')

class WordFrequencyFramework {

    constructor() {
        this.loadEventHandlers = [];
        this.doWorkEventHandlers = [];
        this.endEventHandlers = [];
    }

    registerForLoadEvent(handler) {
        this.loadEventHandlers.push(handler);
    }

    registerForDoWorkEvent(handler) {
        this.doWorkEventHandlers.push(handler);
    }

    registerForEndEvent(handler) {
        this.endEventHandlers.push(handler);
    }

    run(pathToFile) {
        this.loadEventHandlers.forEach(handler => handler(pathToFile));
        
        this.doWorkEventHandlers.forEach(handler => handler());

        this.endEventHandlers.forEach(handler => handler());

    }
}

class DataStorage {
    constructor(wfapp, stopWordFilter) {
        this.data = '';
        this.stopWordFilter = stopWordFilter;
        wfapp.registerForLoadEvent(this.load.bind(this));
        wfapp.registerForDoWorkEvent(this.produceWord.bind(this));
    }

    load(pathToFile) {
        this.data = fs.readFileSync(pathToFile, 'utf-8');
        this.data = this.data.replace(/[\W_]+/g, ' ').toLowerCase();
    }

    produceWord() {
        const dataStr = this.data;
        const words = dataStr.split(' ');
        words.forEach(word => {
            if (!this.stopWordFilter.isStopWord(word)) {
                this.wordEventHandlers.forEach(handler => handler(word));
            }
        });
    }

    registerForWordEvent(handler) {
        this.wordEventHandlers = this.wordEventHandlers || [];
        this.wordEventHandlers.push(handler);
    }
}

class StopWordFilter {
    constructor(wfapp) {
        wfapp.registerForLoadEvent(this.load.bind(this));
    }

    load() {
        const stopWordsFile = fs.readFileSync(path.join(__dirname, './stop_words.txt'), 'utf-8');
        this.stopWords = stopWordsFile.split(',').concat(Array.from({ length: 26}, (_, i) => String.fromCharCode(97 + i)));
    }

    isStopWord(word) {
        return this.stopWords.includes(word);
    }
}

class WordFrequencyCounter {
    constructor(wfapp, dataStorage) {
        this.wordFreqs = {};
        dataStorage.registerForWordEvent(this.incrementCount.bind(this));
        wfapp.registerForEndEvent(this.printFreqs.bind(this));
    }

    incrementCount(word) {
        this.wordFreqs[word] = (this.wordFreqs[word] || 0) + 1;
    }

    printFreqs() {
        const wordFreqs = Object.entries(this.wordFreqs).sort((a, b) => b[1] - a[1]).slice(0, 25);
        wordFreqs.forEach(([word, count]) => console.log(`${word} - ${count}`));
    }
}

if (require.main == module) {
    const wfapp = new WordFrequencyFramework();
    const stopWordFilter = new StopWordFilter(wfapp);
    const dataStorage = new DataStorage(wfapp, stopWordFilter);
    const wordFreqCounter = new WordFrequencyCounter(wfapp, dataStorage);
    const filePath = process.argv[2];
    wfapp.run(filePath);
}

