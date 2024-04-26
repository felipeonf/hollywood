"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// WordFrequencyFramework: Responsável por orquestrar o fluxo de eventos.
var WordFrequencyFramework = /** @class */ (function () {
    function WordFrequencyFramework() {
        // Inicializa os arrays de manipuladores de eventos
        this.loadEventHandlers = [];
        this.doWorkEventHandlers = [];
        this.endEventHandlers = [];
    }
    // Métodos para registrar manipuladores de eventos
    WordFrequencyFramework.prototype.registerForLoadEvent = function (handler) {
        this.loadEventHandlers.push(handler);
    };
    WordFrequencyFramework.prototype.registerForDoWorkEvent = function (handler) {
        this.doWorkEventHandlers.push(handler);
    };
    WordFrequencyFramework.prototype.registerForEndEvent = function (handler) {
        this.endEventHandlers.push(handler);
    };
    // Método para executar os eventos
    WordFrequencyFramework.prototype.run = function (pathToFile) {
        this.loadEventHandlers.forEach(function (handler) { return handler(pathToFile); });
        this.doWorkEventHandlers.forEach(function (handler) { return handler(); });
        this.endEventHandlers.forEach(function (handler) { return handler(); });
    };
    return WordFrequencyFramework;
}());
// DataStorage: Responsável por carregar os dados do arquivo e filtrar palavras.
var DataStorage = /** @class */ (function () {
    function DataStorage() {
        this.data = '';
    }
    // Método para carregar os dados do arquivo
    DataStorage.prototype.load = function (pathToFile) {
        this.data = fs.readFileSync(pathToFile, 'utf-8');
        // Filtra caracteres não alfanuméricos e converte para minúsculas
        this.data = this.data.replace(/[\W_]+/g, ' ').toLowerCase();
    };
    // Método para obter as palavras do texto
    DataStorage.prototype.getWords = function () {
        return this.data.split(' ');
    };
    return DataStorage;
}());
// StopWordFilter: Responsável por carregar e filtrar as stop words.
var StopWordFilter = /** @class */ (function () {
    function StopWordFilter() {
        this.stopWords = [];
        this.load();
    }
    // Método para carregar as stop words do arquivo
    StopWordFilter.prototype.load = function () {
        var stopWordsFile = fs.readFileSync(path.join(__dirname, './stop_words.txt'), 'utf-8');
        this.stopWords = stopWordsFile.split(',').concat(Array.from({ length: 26 }, function (_, i) { return String.fromCharCode(97 + i); }));
    };
    // Método para verificar se uma palavra é uma stop word
    StopWordFilter.prototype.isStopWord = function (word) {
        return this.stopWords.includes(word);
    };
    return StopWordFilter;
}());
// WordFrequencyCounter: Responsável por contar a frequência das palavras.
var WordFrequencyCounter = /** @class */ (function () {
    function WordFrequencyCounter() {
        this.wordFreqs = {};
    }
    // Método para incrementar a contagem de uma palavra
    WordFrequencyCounter.prototype.incrementCount = function (word) {
        this.wordFreqs[word] = (this.wordFreqs[word] || 0) + 1;
    };
    // Método para obter as 25 palavras com maior frequência
    WordFrequencyCounter.prototype.getTopWords = function () {
        return Object.entries(this.wordFreqs).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 25);
    };
    return WordFrequencyCounter;
}());
// Aplicação principal
var wfapp = new WordFrequencyFramework();
var dataStorage = new DataStorage();
var stopWordFilter = new StopWordFilter();
var wordFreqCounter = new WordFrequencyCounter();
// Registra os manipuladores de eventos
wfapp.registerForLoadEvent(dataStorage.load.bind(dataStorage));
wfapp.registerForDoWorkEvent(function () {
    dataStorage.getWords().forEach(function (word) {
        if (!stopWordFilter.isStopWord(word)) {
            wordFreqCounter.incrementCount(word);
        }
    });
});
wfapp.registerForEndEvent(function () {
    wordFreqCounter.getTopWords().forEach(function (_a) {
        var word = _a[0], count = _a[1];
        return console.log("".concat(word, " - ").concat(count));
    });
});
// Obtém o caminho do arquivo do argumento da linha de comando
var filePath = process.argv[2];
// Executa a aplicação
wfapp.run(filePath);
