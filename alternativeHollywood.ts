import * as fs from 'fs';
import * as path from 'path';

// WordFrequencyFramework: Responsável por orquestrar o fluxo de eventos.
class WordFrequencyFramework {
    private loadEventHandlers: Function[];
    private doWorkEventHandlers: Function[];
    private endEventHandlers: Function[];

    constructor() {
        // Inicializa os arrays de manipuladores de eventos
        this.loadEventHandlers = [];
        this.doWorkEventHandlers = [];
        this.endEventHandlers = [];
    }

    // Métodos para registrar manipuladores de eventos
    registerForLoadEvent(handler: Function) {
        this.loadEventHandlers.push(handler);
    }

    registerForDoWorkEvent(handler: Function) {
        this.doWorkEventHandlers.push(handler);
    }

    registerForEndEvent(handler: Function) {
        this.endEventHandlers.push(handler);
    }

    // Método para executar os eventos
    run(pathToFile: string) {
        this.loadEventHandlers.forEach(handler => handler(pathToFile));
        this.doWorkEventHandlers.forEach(handler => handler());
        this.endEventHandlers.forEach(handler => handler());
    }
}

// DataStorage: Responsável por carregar os dados do arquivo e filtrar palavras.
class DataStorage {
    private data: string;

    constructor() {
        this.data = '';
    }

    // Método para carregar os dados do arquivo
    load(pathToFile: string) {
        this.data = fs.readFileSync(pathToFile, 'utf-8');
        // Filtra caracteres não alfanuméricos e converte para minúsculas
        this.data = this.data.replace(/[\W_]+/g, ' ').toLowerCase();
    }

    // Método para obter as palavras do texto
    getWords(): string[] {
        return this.data.split(' ');
    }
}

// StopWordFilter: Responsável por carregar e filtrar as stop words.
class StopWordFilter {
    private stopWords: string[];

    constructor() {
        this.stopWords = [];
        this.load();
    }

    // Método para carregar as stop words do arquivo
    load() {
        const stopWordsFile = fs.readFileSync(path.join(__dirname, './stop_words.txt'), 'utf-8');
        this.stopWords = stopWordsFile.split(',').concat(Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)));
    }

    // Método para verificar se uma palavra é uma stop word
    isStopWord(word: string): boolean {
        return this.stopWords.includes(word);
    }
}

// WordFrequencyCounter: Responsável por contar a frequência das palavras.
class WordFrequencyCounter {
    private wordFreqs: { [word: string]: number };

    constructor() {
        this.wordFreqs = {};
    }

    // Método para incrementar a contagem de uma palavra
    incrementCount(word: string) {
        this.wordFreqs[word] = (this.wordFreqs[word] || 0) + 1;
    }

    // Método para obter as 25 palavras com maior frequência
    getTopWords(): [string, number][] {
        return Object.entries(this.wordFreqs).sort((a, b) => b[1] - a[1]).slice(0, 25);
    }
}

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
