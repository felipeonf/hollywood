Repostório que consiste em mostrar o funcionamento do estilo de programação Hollywood na linguagem javascript
# Para iniciar o script:
  ### Necessário ter o Node.js instalado em sua máquina: https://nodejs.org/en/download
  ### Ter arquivos de example.txt e stop_word.txt no mesmo diretório do arquivo hollywood.js
  ### Rodar o comando seguinte comando no terminal:
     node hollywood.js example.txt

# Para rodar em typescript:
  ### Para ter o typescript instalado no projeto: 
    npm install typescript --save-dev no diretório raiz
  ### Rode npx tsc para configurar o compilador
  ### Também precisamos do módulo de tipos do node_modules, então rode:
    npm i --save-dev @types/node
  ### Depois disso apenas rode:
    node <nome_do_arquivo.ts> example.txt


# Para rodar o projeto normalmente e instalar as dependências:
    git pull
    npm install
    node altenativeHollywod.ts example.txt
