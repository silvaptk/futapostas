const Bet = require('../models/bet');

exports.getBets = async (req, res) => {
  const { id: userId } = req.user 

  try {
    const userBets = await Bet.get({ userId })

    return res.send(userBets.map(bet => ({
      ...bet,
      game: {
        id: bet.game.id,
        place: bet.game.place,
        date: bet.game.date,
        home_team: bet.game.homeTeam,
        away_team: bet.game.awayTeam
      }
    })))
  } catch (error) {
    const { status, message } = JSON.parse(
      error.toString().replace("Error:", "")
    )

    return res.status(status).send({ error: { message } })
  }
}

exports.getBet = async (req, res) => {
  const { id } = req.params 
  const { id: userId } = req.user 

  let bet 
  try {
    bet = await Bet.get({ id, userId })
  } catch (error) {
    const { status, message } = JSON.parse(
      error.toString().replace("Error:", "")
    )
    return res.status(status).send({ error: { message } })
  }

  if (!bet) {
    return res.status(404).send({
      error: {
        message: "Aposta não encontrada"
      }
    })
  }

  return res.send({
    id: bet.id,
    type: bet.type,
    value: bet.value,
    game: {
      id: bet.game.id,
      date: bet.game.date,
      home_team: {
        id: bet.game.homeTeam.id,
        name: bet.game.homeTeam.name,
      },
      away_team: {
        id: bet.game.awayTeam.id,
        name: bet.game.awayTeam.name,
      },
    }
  })
}

exports.createBet = async (req, res) => {
    const { type, value, result: gameResult, game } = req.body 
    const { email } = req.user

    const newBet = new Bet(
      email,
      type,
      gameResult,
      value,
      game
    )

    let result 

    try {
      result = await newBet.save()
    } catch (error) {
      const { message, status } = JSON.parse(
        error.toString().replace("Error:", "")
      )

      return res.status(status).send({ error: { message } })
    }

    if (result) {
      return res.status(200).json({
        message: "Aposta criada com sucesso",
        bet: {
          id: newBet.id,
          value: newBet.value,
          result: newBet.result, 
          game: newBet.gameId, 
          type: newBet.type,
        }
      })
    }

    return res.status(400).json({
      error: {
        message: "Verifique os dados inseridos e tente novamente"
      }
    })
}

exports.updateBet = (req, res, next) => {}

exports.deleteBet = (req, res, next) => {}