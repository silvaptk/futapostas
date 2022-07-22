const { query } = require("../databases/postgres")

module.exports = class Deposit {
  constructor(value, userId) {
    this.value = value
    this.userId = userId
  }

  static async get ({ id, userId }) {
    try {
      let result 
      if (id) {
        result = await query(`SELECT * FROM deposito WHERE id = ${id}`)

        return {
          id,
          value: result[0].valor,
        }        
      } else {
        result = await query(`SELECT * FROM deposito WHERE usuario = ${userId}`)

        return result.map(item => ({
          id: item.id, 
          value: item.valor,
        }))
      }
    } catch (error) {
      console.log(error)

      throw new Error("Não foi possível obter os depósitos")
    }
  }

  async updateUserWallet () {
    await query(`
      INSERT INTO 
        deposito (valor, usuario) 
      VALUES 
        (${this.value}, ${this.userId})
    `)

    await query(`
      UPDATE Usuario 
        SET carteira = carteira + ${this.value} 
        WHERE id = ${this.userId}
    `)

    const newUserData = (await query(
      `SELECT * FROM usuario u WHERE u.id = ${this.userId}`
    ))[0]
    
    return newUserData
  }
}