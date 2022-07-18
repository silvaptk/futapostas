const { query: postgresQuery } = require("../databases/postgres")
const { run: runOnNeo4j } = require("../databases/neo4j")

module.exports = class Bet {
  constructor(email, tipoAposta, valor, jogo_id) {
    this.email = email;
    this.tipoAposta = tipoAposta;
    this.valor = valor;
    this.resultado = resultado;
    this.jogo_id = jogo_id;
  }

  async save() {
    try {
      await runOnNeo4j(
        `
        MATCH 
          (a:Usuário),
          (b:Jogo)
        WHERE a.email = ${this.email} AND
              b.id = ${this.jogo_id}
        MERGE (a)-[:${this.tipoAposta} ${this.resultado} ${this.valor}]->(b)
        `
      )
    } catch (error) {
      console.log(error);
      return false
    }

    try {
      await postgresQuery(
        `
          INSERT INTO 
            Apostas (tipoAposta, valor, lucroOuPerda, montanteUsuario)
          VALUES
            (\'${this.tipoAposta}\', \'${this.valor}\', NULL, NULL) 
        `
      )
    } catch (error) {
      console.log(error);
      return false
    }

    return true   
  }
}
