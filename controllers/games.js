const Game = require("../models/game")

exports.getGames = async (req, res) => {
  const allGames = await Game.get()

  res.status(200).json(allGames)
}

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

exports.finishGame = async (req, res) => {
  const { homeTeam, awayTeam } = req.body;
  const { id } = req.params;

  try {
    const result = await Game.finishGame(id, homeTeam, awayTeam);
    res.status(200).json({
      message: 'Resultado do jogo gravado com sucesso',
      payload: result,
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({
      message: 'Erro finalizando jogo',
      error: e
    })
  }
}
