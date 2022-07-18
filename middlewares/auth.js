const jwt = require("jsonwebtoken")

const User = require("../models/user")

exports.authenticationMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"]

  let user 

  try {
    const userData = jwt.verify(token.replace("Bearer ", ""), process.env.TOKEN_SECRET)

    if (userData) {
      user = new User(
        userData.nome,
        userData.email,
        userData.senha,
        userData.cpf,
        userData.privacidade_do_perfil,
        userData.carteira
      )

      user.id = userData.id
    }
  } catch (error) {
    console.log(error)
  }

  if (user) {
    req.user = user 
    next()
  } else {
    return res.status(401).json({
      error: {
        message: "Você precisa se autenticar para acessar essa rota"
      }
    })
  }
}