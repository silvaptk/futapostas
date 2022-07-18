const Game = require("../models/game")

exports.getGames = (req, res) => {}

exports.getGame = (req, res) => {}

exports.createGame = async (req, res) => {
  const { team_a, team_b, date, place } = req.body

  const game = new Game(
    place, 
    date,
    team_a,
    team_b 
  )

  const result = await game.save()

  if (result) {
    return res.status(200).json({
      message: "Jogo criado com sucesso"
    })
  }

  return res.status(400).json({
    error: {
      message: "Não foi possível criar o jogo"
    }
  })
}

exports.updateGame = (req, res) => {}

exports.deleteGame = (req, res) => {}