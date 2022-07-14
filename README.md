# API REST FutApostas

## Introdução

API REST criada para gerenciar sistema de apostas. As entidades do sistema são 

- **aposta** que representa a aposta do usuário
- **usuário** que representa o apostador, utilizador da plataforma
- **jogo** que representa o jogo em que se aposta
- **time** que representa o time que joga 
- **jogador** que representa o jogador do time 

A API deve permitir, principalmente, que o usuário realize apostas sobre o jogo e ganhe por isso. Ele também deve ser capaz de visualizar as apostas, bem como visualizar os jogos, os times, os jogadores e etc.

## Estrutura de pastas

### **`app.js`**

A aplicação começa em `./app.js`. Esse arquivo é responsável por iniciar o servidor na porta 8080. Ele também direciona as requisições para as rotas adequadas.

### **`./routes`**

`./routes` é o diretório que contém as definições das rotas da API. Cada arquivo representa uma entidade do sistema e concentra as rotas relacionadas a essa entidade. Cada rota é controlada por um controlador.

### **`./controllers`**

`./controllers` é o diretório qu contém as funções responsáveis por controlar as rotas. Cada arquivo representa uma entidade do sistema e concentra métodos para controlar as rotas relacionadas a essa entidade. Os controladores operam os modelos da aplicação.

### **`./models`**

`./models` é o diretório que contém os modelos da aplicação. Cada arquivo do diretório representa uma entidade do sistema e contém a definição da classe que representa a entidade na API. Os métodos dessa classe devem acessar os bancos de dados para obter os dados apropriados e retorná-los.

### **`./databases`**

`./databases` é o diretório que contém funções de acesso ao banco de dados. Cada arquivo do diretório representa um banco de dados e concentra funções que permitem conexão e realização de consultas e modificações dos bancos de dados.