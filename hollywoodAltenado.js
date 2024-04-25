// 'WordFrequencyFramework: Responsável por orquestrar o fluxo de eventos.
// wordFrequencyFramework.js
class WordFrequencyFramework {
    constructor() {
        // Inicializa os arrays de manipuladores de eventos
        this.loadEventHandlers = [];
        this.doWorkEventHandlers = [];
        this.endEventHandlers = [];
    }

    // Métodos para registrar manipuladores de eventos
    registerForLoadEvent(handler) {
        this.loadEventHandlers.push(handler);
    }

    registerForDoWorkEvent(handler) {
        this.doWorkEventHandlers.push(handler);
    }

    registerForEndEvent(handler) {
        this.endEventHandlers.push(handler);
    }

    // Metodo para executar os eventos
    run(pathToFile) {
        this.loadEventHandlers.forEach(handler => handler(pathToFile));
        this.doWorkEventHandlers.forEach(handler => handler());
        this.endEventHandlers.forEach(handler => handler());
    }
}

module.exports = WordFrequencyFramework;

// DataStorage: Responsável por carregar os dados do arquivo e filtrar palavras.
// dataStorage.js
const fs = require('fs');

class DataStorage {
    constructor() {
        this.data = '';
    }

    // Metodo para carregar os dados do arquivo
    load(pathToFile) {
        this.data = fs.readFileSync(pathToFile, 'utf-8');
        // Filtra caracteres não alfanuméricos e converte para minúsculas
        this.data = this.data.replace(/[\W_]+/g, ' ').toLowerCase();
    }

    // Metodo para obter as palavras do texto
    getWords() {
        return this.data.split(' ');
    }
}

module.exports = DataStorage;

// StopWordFilter: Responsável por carregar e filtrar as stop words.
// stopWordFilter.js
const path = require('path');

class StopWordFilter {
    constructor() {
        this.stopWords = [];
        this.load();
    }

    // Metodo para carregar as stop words do arquivo
    load() {
        const stopWordsFile = fs.readFileSync(path.join(__dirname, './stop_words.txt'), 'utf-8');
        this.stopWords = stopWordsFile.split(',').concat(Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)));
    }

    // Metodo para verificar se uma palavra é uma stop word
    isStopWord(word) {
        return this.stopWords.includes(word);
    }
}

module.exports = StopWordFilter;

// WordFrequencyCounter: Responsável por contar a frequência das palavras.
// wordFrequencyCounter.js
class WordFrequencyCounter {
    constructor() {
        this.wordFreqs = {};
    }

    // Metodo para incrementar a contagem de uma palavra
    incrementCount(word) {
        this.wordFreqs[word] = (this.wordFreqs[word] || 0) + 1;
    }

    // Metodo para obter as 25 palavras com maior frequência
    getTopWords() {
        return Object.entries(this.wordFreqs).sort((a, b) => b[1] - a[1]).slice(0, 25);
    }
}

module.exports = WordFrequencyCounter;

// Aplicação principal
const wfapp = new WordFrequencyFramework();
const dataStorage = new DataStorage();
const stopWordFilter = new StopWordFilter();
const wordFreqCounter = new WordFrequencyCounter();

// Registra os manipuladores de eventos
wfapp.registerForLoadEvent(dataStorage.load.bind(dataStorage));
wfapp.registerForDoWorkEvent(() => {
    dataStorage.getWords().forEach(word => {
        if (!stopWordFilter.isStopWord(word)) {
            wordFreqCounter.incrementCount(word);
        }
    });
});
wfapp.registerForEndEvent(() => {
    wordFreqCounter.getTopWords().forEach(([word, count]) => console.log(`${word} - ${count}`));
});

// Obtém o caminho do arquivo do argumento da linha de comando
const filePath = process.argv[2];
// Executa a aplicação
wfapp.run(filePath);
