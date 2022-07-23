const neo4j = require("../databases/neo4j")
const postgres = require("../databases/postgres")
const User = require("./user")

module.exports = class Bet {
  constructor(userEmail, type, result, valor, gameId) {
    this.userEmail = userEmail
    this.type = type
    this.value = valor
    this.result = result
    this.gameId = gameId
  }

  static async get ({ id, userId }) {
    if (id) {
      try {
        const result = await postgres.query(`
          SELECT 
            b.tipo AS "betType",
            b.lucro_ou_perda AS "betResult",
            b.valor AS "betValue",
            b.montante_do_usuario AS "betAmount",
            g.id AS "gameId",
            g.data_horario AS "gameDate",
            g.local AS "gamePlace",
            ta.id AS "homeTeamId",
            ta.nome AS  "homeTeamName",
            tb.id AS "awayTeamId",
            tb.nome AS  "awayTeamName"
          FROM apostas b 
            JOIN jogo g 
              ON b.jogo = g.id 
            JOIN usuario u 
              ON b.usuario = u.id 
            JOIN time ta 
              ON g.timea = ta.id 
            JOIN time tb
              ON g.timeb = tb.id 
          WHERE b.id = ${id}
        `)

        if (!result.length) {
          return null
        }

        return {
          type: result[0].betType,
          result: result[0].betResult,
          value: result[0].betValue,
          amount: result[0].betAmount,
          game: {
            id: result[0].gameId,
            place: result[0].gamePlace,
            date: result[0].gameDate,
            homeTeam: {
              id: result[0].homeTeamId,
              name: result[0].homeTeamName,
            },
            awayTeam: {
              id: result[0].awayTeamId,
              name: result[0].awayTeamName,
            }
          }
        }
      } catch (error) {
        console.log(error)

        throw new Error(JSON.stringify({
          message: "Erro ao obter a aposta",
          status: 500 
        }))
      }
    }

    if (userId) {
      try {
        const result = await postgres.query(`
          SELECT 
            b.id AS "betId",
            b.tipo AS "betType",
            b.lucro_ou_perda AS "betResult",
            b.valor AS "betValue",
            b.montante_do_usuario AS "betAmount",
            g.id AS "gameId",
            g.data_horario AS "gameDate",
            g.local AS "gamePlace",
            ta.id AS "homeTeamId",
            ta.nome AS  "homeTeamName",
            tb.id AS "awayTeamId",
            tb.nome AS  "awayTeamName"
          FROM apostas b 
            JOIN jogo g 
              ON b.jogo = g.id 
            JOIN usuario u 
              ON b.usuario = u.id 
            JOIN time ta 
              ON g.timea = ta.id 
            JOIN time tb
              ON g.timeb = tb.id
          WHERE u.id = ${userId}
        `)

        if (!result.length) {
          return []
        }

        return result.map(item => ({
          id: item.betId,
          type: item.betType,
          result: item.betResult,
          value: item.betValue,
          amount: item.betAmount,
          game: {
            id: item.gameId,
            place: item.gamePlace,
            date: item.gameDate,
            homeTeam: {
              id: item.homeTeamId,
              name: item.homeTeamName,
            },
            awayTeam: {
              id: item.awayTeamId,
              name: item.awayTeamName,
            }
          }
        }))
      } catch (error) {
        console.log(error)

        throw new Error(JSON.stringify({
          message: "Erro ao obter as apostas",
          status: 500 
        }))
      }
    }
  }

  async save () {
    const wallet = await User.getWalletByEmail(this.userEmail)

    if (wallet - this.value < 0) {
      throw new Error(JSON.stringify({
        message: "Você não tem saldo suficiente para realizar a aposta"
      }))
    }

    User.updateWalletByEmail(this.userEmail, -this.value)

    try {
      await postgres.query(`
        INSERT INTO 
          apostas (tipo, valor, lucro_ou_perda, usuario, jogo, data)
        VALUES 
          (
            '${this.type}', 
            ${this.value}, 
            '',
            (SELECT id FROM usuario WHERE usuario.email = '${this.userEmail}'),
            ${this.gameId},
            '${new Date().toISOString()}'
          )
      `)

      const result = await postgres.query(`
        SELECT id FROM apostas WHERE 
          apostas.jogo = ${this.gameId} AND 
          apostas.usuario = (
            SELECT id FROM usuario WHERE email = '${this.userEmail}'
          )
      `)

      this.id = Number(result[0].id)
    } catch (error) {
      console.log(error)

      throw new Error(JSON.stringify({
        message: "Erro ao criar aposta",
        error 
      }))
    }
    
    try {
      await neo4j.run(`
        MATCH 
          (a:Usuário),
          (b:Jogo)
        WHERE a.Email = \"${this.userEmail}\" AND
              b.Id = ${this.gameId}
        CREATE (a)-[
          :${this.type} {
            Id: ${this.id},
            Resultado: \"${this.result}\", 
            Valor: ${this.value}}
        ]->(b)
      `)
    } catch (error) {
      console.log(error)

      throw new Error(JSON.stringify({
        message: "Erro ao criar a aposta",
        error: error 
      }))
    }

    return true 
  }

  static async setUserAmount (betId, amount) {
    try {
      await postgres.query(`
        UPDATE apostas 
          SET montante_do_usuario = ${amount}
          WHERE id = ${betId}
      `)
    } catch (error) {
      return false 
    }

    return true 
  }
}
