const jwt = require("jsonwebtoken")

const User = require("../models/user")

exports.authUser = async (req, res) => {
  const { email, password } = req.body 

  let user

  try {
    user = await User.get({ email, password })
  } catch (error) {
    console.log(error)
  }

  if (!user) {
    return res.status(400).json({
      error: {
        message: "E-mail ou senha incorretos"
      }
    })
  }

  return res.status(200).json({
    token: jwt.sign({ email, password, id: user.id }, process.env.TOKEN_SECRET)
  })
}

exports.createUser = async (req, res) => {
  const { name, email, password, personal_identifier, profile_privacy } = req.body 
  const newUser = new User(
    name,
    email, 
    password,
    personal_identifier,
    profile_privacy
  )

  const result = await newUser.save()

  if (result) {
    return res.status(200).json({
      message: "Usuário criado com sucesso",
      payload: newUser
    })
  }

  return res.status(400).json({
    error: {
      message: "Verifique os dados inseridos e tente novamente"
    }
  })
}

exports.updateUser = async (req, res) => {
  const { name, email, password, personal_identifier, profile_privacy } = req.body 

  const { user } = req 

  const result = await user.update({ 
    name, 
    email, 
    password, 
    personal_identifier, 
    profile_privacy 
  })

  if (result) {
    return res.status(200).json({
      message: "O seu registro foi alterado com sucesso",
      user
    })
  }

  return res.status(400).json({
    message: "Verifique os seus dados e tente novamente"
  })
}

exports.getUser = async (req, res) => {
  let user 

  try {
    [user] = await User.get({ ids: [req.user.id] })
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message 
      }
    })
  }
  

  res.status(200).send({
    id: user.id,
    name: user.name,
    email: user.email,
    profile_privacy: user.profilePrivacy,
    personal_identifier: user.personalIdentifier,
    wallet: user.wallet, 
  })
}