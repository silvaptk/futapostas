const { run: runOnNeo4j } = require("../databases/neo4j");
const User = require("./user");

module.exports = class Bet {
  constructor(email, tipoAposta, resultado, valor, jogo_id) {
    this.email = email;
    this.tipoAposta = tipoAposta;
    this.valor = valor;
    this.resultado = resultado;
    this.jogo_id = jogo_id;
  }

  async save () {
    try {
      const wallet = await User.getWalletByEmail(this.email);
      if (wallet - this.valor < 0) {
        console.log("Você não tem dinheiro suficiente para essa transação");
        return false;
      }
      User.updateWalletByEmail(this.email, -this.valor)
      await runOnNeo4j(`
        MATCH 
          (a:Usuário),
          (b:Jogo)
        WHERE a.email = \"${this.email}\" AND
              b.Id = ${this.jogo_id}
        CREATE (a)-[:${this.tipoAposta} {Resultado: \"${this.resultado}\", Valor: ${this.valor}}]->(b)
      `)
      const result = runOnNeo4j(`
        MATCH 
          (a:Usuário)-[r]->(b:Jogo)
        WHERE a.email = \"${this.email}\" AND
          b.Id = ${this.jogo_id}
        RETURN a.email, b.Id, r
      `)
      return result;
    } catch (error) {
      console.log(error);
      return false
    }
  }
}
