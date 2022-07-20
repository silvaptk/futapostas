const Deposit = require("../models/deposit")

exports.createDeposit = async (req, res) => {
  const { value } = req.body
  const user = req.user

  const deposit = new Deposit(value, user.id)
  
  try {
    const userAfterChange = await deposit.updateUserWallet()
  
    return res.status(201).json({
      message: "Deposito realizado com sucesso",
      user: {
        id: userAfterChange.id, 
        name: userAfterChange.nome,
        personal_identifier: userAfterChange.cpf, 
        email: userAfterChange.email,
        profile_privacy: userAfterChange.privacidade_do_perfil,
        wallet: userAfterChange.carteira,
      }
    })
  } catch(e) {
    console.error(e)
    return res.status(500).json({
      message: "Erro criando deposito",
      error: e
    })
  }
}

exports.getDeposits = async (req, res) => {
  let deposits 

  try {
    deposits = await Deposit.get({ userId: req.user.id })
  } catch (error) {
    console.log(error)

    return res.status(500).send({
      error: {
        message: error.message 
      }
    })
  }

  return res.status(200).send(deposits) 
}