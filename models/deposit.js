const { query } = require("../databases/postgres");
const User = require("./user");

module.exports = class Deposit {
  constructor(value, userId) {
    this.value = value;
    this.userId = userId;
  }

  async updateUserWallet() {
    const userData = await query(`SELECT * FROM usuario u WHERE u.id=${this.userId}`);
    const newValue = userData[0].carteira + this.value;
    await query(`UPDATE Usuario SET carteira = ${newValue} WHERE id=${this.userId}`);
    const newUserData = await query(`SELECT * FROM usuario u WHERE u.id=${this.userId}`);
    return newUserData;
  }
}