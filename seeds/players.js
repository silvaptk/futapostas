const players = require("../dados/jogadores.json")
const postgres = require("../databases/postgres")

const insertPlayers = async () => {
  try {
    const query = `
      INSERT INTO jogador(nome, data_de_nascimento, time) VALUES 
      ${players.map(player => [
        `('${player.info.nome}'`, 
        `'${player.info.datanascimento}'`, 
        `${player.info.idTime})`
      ].join(", "))}
    `

    await postgres.query(query)
  } catch (error) {
    console.log(error)
  }
}

module.exports = insertPlayers