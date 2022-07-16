const jwt = require("jsonwebtoken")

const User = require("../models/user")

exports.authUser = async (req, res) => {
  const { email, password } = req.body 

  let user;

  try {
    user = await User.get({ email, password })
  } catch (error) {
    console.log(error)
  }

  if (!user) {
    return res.status(401).json({
      error: {
        message: "E-mail ou senha incorretos"
      }
    })
  }

  return res.status(200).json({
    token: jwt.sign(user, process.env.TOKEN_SECRET)
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
      message: "Usuário criado com sucesso"
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
      message: "O seu registro foi alterado com sucesso"
    })
  }

  return res.status(400).json({
    message: "Verifique os seus dados e tente novamente"
  })
}