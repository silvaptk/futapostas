const postgres = require("../databases/postgres")

module.exports = class Team {
  constructor(nome) {
    this.nome = nome;
  }
}
