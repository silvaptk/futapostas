const postgres = require('../databases/postgres');

module.exports = class Player {
  constructor(id, nome, dataDeNascimento) {
    this.id = id;
    this.nome = nome;
    this.dataDeNascimento = dataDeNascimento;
  }

  static async get (id) {
    if (id) {
      return {}
    }

    let players;

    try {
      players = await postgres.query(`
        SELECT 
          j.id AS "jogadorId", j.nome AS "jogadorNome", j.data_De_Nascimento AS "jogadorNascimento",
          tA.id AS "jogadorTimeId", tA.nome AS "jogadorTimeNome"
        FROM Jogador j 
          JOIN "time" tA ON j.time = tA.id 
      `);

      console.log(players);
    } catch (error) {
      console.log(error);
    }

    return players.map(player => ({
      id: player.jogadorId,
      name: player.jogadorNome,
      born: player.dataDeNascimento,
      team: {
        id: player.jogadorTimeId,
        name: player.jogadorTimeNome
      }
    }))  
  }
}
