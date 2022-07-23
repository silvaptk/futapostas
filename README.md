# API REST FutApostas

## **Autores**

| **Nome**                      | **NUSP** |
| -                             | -        |
| Patrick Silva Souza           | 11228121 |
| Francisco Eugênio Wernke      | 11221870 |
| Daniel Angelo Esteves Lawand  | 10297693 |

## **Introdução**

API REST criada para gerenciar sistema de apostas. As entidades do sistema são 

- **aposta** que representa a aposta do usuário
- **usuário** que representa o apostador, utilizador da plataforma
- **jogo** que representa o jogo em que se aposta
- **time** que representa o time que joga 
- **jogador** que representa o jogador do time 

A API deve permitir, principalmente, que o usuário realize apostas sobre o jogo e ganhe por isso. Ele também deve ser capaz de visualizar as apostas, bem como visualizar os jogos, os times, os jogadores e etc.

## **Executando**

Basta seguir o passo a passo a seguir:

1. Executar `npm install` para instalar as dependências do projeto (É preciso ter o **Node.js** instalado)
2. Executar `docker compose up` para executar os contêineres Docker contendo os bancos de dados 
3. Executar `npm run migrate` para criar o esquema do banco de dados Postgres apropriadamente
4. **(Passo opcional)** Executar `npm run seed` para popular os bancos de dados com alguns dados iniciais
3. Executar `npm start` para iniciar o servidor na porta 9876 

Feito isso, o servidor já irá aceitar requisições.

## **Estrutura de pastas**

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

## **Rotas disponíveis**

### **Usuario**

- `POST /users` Rota para criar usuário. Segue exemplo de corpo: 

  ```json
  {
    "name": "John Doe",
    "email": "john.doe@email.com",
    "password": "john",
    "personal_identifier": "000.000.000-00",
    "profile_privacy: false 
  }
  ```

- `POST /users/auth` Rota para autenticar usuário. Devolve o *token* JWT para utilizar nas requisições protegidas. Segue exemplo de corpo: 

  ```json
  {
    "email": "John Doe",
    "password": "john"
  }
  ```

- `GET /users` Rota para obter os dados do usuário autenticado. **Essa rota necessita de autenticação**

### **Depósito**

- `POST /deposits` Para realizar depósito na carteira virtual. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  { 
    "value": 500
  }
  ```

- `GET /deposits` Para obter os depósitos realizados na conta autenticada. **Essa rota necessita de autenticação**

### **Time**

- `GET /teams` Para obter os times armazenados na plataforma. **Essa rota necessita de autenticação**

- `GET /teams/:id` Para obter um time em específico armazenado na plataforma. **Essa rota necessita de autenticação**

- `POST /teams` Para criar um time. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "name": "Santos"
  }
  ```

- `PUT /teams/:id` Para atualizar um time. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "name": "Santos FC"
  }
  ```

### **Jogador**

- `GET /players` Para obter todos os jogadores da plataforma.  **Essa rota necessita de autenticação**

- `GET /players/:id` Para obter os dados de um jogador em específico. **Essa rota necessita de autenticação**

- `POST /players/:id` Para inserir um jogador na plataforma. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {	
    "name": "Lucas Piton",
    "birth_date": "2000-10-09",
    "birthplace": "Jundiaí (SP)",
    "weight": 68,
    "height": 175,
    "team": 1
  }
  ```

### **Jogo**

- `GET /games` Rota para obter todos os jogos da plataforma. **Essa rota necessita de autenticação**

- `GET /games/:id` Rota para obter os dados de um jogo em específico. **Essa rota necessita de autenticação**

- `POST /games` Rota para inserir um jogo na plataforma. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 
  
  ```json
  {
    "home_team": 1,
    "away_team": 4,
    "place": "Itaquerão",
    "date": "2022-07-23T12:00:00+00:00"
  }
  ```

- `PUT /games/:id/starting-players` Rota para definir os titulares do jogo. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "home": [1, 2, 3, 4, 5, 6 ,7 , 8, 9, 10, 34],
    "away": [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]
  }
  ```

- `POST /games/:id/add-event` Rota para adicionar um evento ao jogo (cartão amarelo, cartão vermelho, impedimento, gol, etc.). **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "type": "GOAL",
    "author": 1,
    "secondary_author": null,
    "minute": 75
  }
  ```

- `PUT /games/:id/finish` Rota para finalizar o jogo, consequentemente distribuir o valor acumulado dentre os usuários. **Essa rota necessita de autenticação** 

### **Aposta**

- `GET /bets` Rota para obter as apostas do usuário autenticado. **Essa rota necessita de autenticação** 

- `GET /bets/:id` Rota para obter os dados de uma aposta em específico. **Essa rota necessita de autenticação** 

- `POST /bets` Rota para inserir uma aposta. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "type": "TIME_VENCEDOR",
    "value": 200,
    "game": 4,
    "result": 1
  }
  ```

### **Resenha**

- `POST /reviews` Rota para criar uma resenha. **Essa rota necessita de autenticação**. Segue exemplo de corpo: 

  ```json
  {
    "comment": "Bicho pegando como sempre. Pra cimaaa",
    "type": "game",
    "reference": 3
  }
  ```

## Observações

Idealmente utilize o Insomnia para testar a aplicação. Ele tem funcionalidades bem interessantes. Utilize o arquivo `./request-collection-example.json` para começar. No Insomnia, na tela inicial, utilize o botão que diz ***Create*** e, depois, clique em ***File*** no *menu* que surge para utilizar a coleção que o arquivo representa.