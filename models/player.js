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

    let players 

    try {
      players = await postgres.query(`
        SELECT 
          j.id AS "jogadorId", j.nome AS "jogadorNome", j.dataDeNascimento AS "jogadorNascimento",
          tA.id AS "jogadorTimeId", tA.nome AS "jogadorTimeNome",
        FROM Jogador j 
          JOIN "time" tA ON j.time = tA.id 
      `)

      console.log(result)
    } catch (error) {
      console.log(error)
    }

    return jogadorTimeId.map(player => ({
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
