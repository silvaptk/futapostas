const Deposit = require('../models/deposit');

exports.createDeposit = async (req, res, next) => {
  const { value } = req.body;
  const user = req.user;

  const deposit = new Deposit(value, user.id);
  try {
    const userAfterChange = await deposit.updateUserWallet();
  
    return res.status(201).json({
      message: "Deposito feito com sucesso",
      payload: userAfterChange
    });
  } catch(e) {
    console.error(e);
    return res.status(500).json({
      message: "Erro criando deposito",
      error: e
    });
  }


}