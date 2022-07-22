const Game = require("../models/game")
const Player = require("../models/player")
const Review = require("../models/review")
const User = require("../models/user")

exports.getGames = async (req, res) => {
  const allGames = await Game.get()

  res.status(200).json(allGames)
}

exports.getGame = async (req, res) => {
  const { id } = req.params 

  let game 

  try {
    game = await Game.get(id)
  } catch (error) {
    console.log(error)

    return res.status(500).send({
      error: {
        message: "Não foi possível recuperar o jogo"
      }
    })
  }

  if (game.startingPlayers) {
    try {
      const startingPlayers = await Player.get([
        ...game.startingPlayers.homeTeam, 
        ...game.startingPlayers.awayTeam
      ])

      game.startingPlayers.homeTeam = startingPlayers.filter(
        player => game.startingPlayers.homeTeam.includes(player.id)
      ).map(
        player => ({ id: player.id, name: player.name })
      )

      game.startingPlayers.awayTeam = startingPlayers.filter(
        player => game.startingPlayers.awayTeam.includes(player.id)
      ).map(
        player => ({ id: player.id, name: player.name })
      )
    } catch (error) {
      return res.status(500).send({
        error: {
          message: "Não foi possível recuperar o jogo"
        }
      })
    }
  }

  const lastReviews = await Review.get("game", id)

  if (lastReviews?.length) {
    const userIds = Array.from(new Set(
      lastReviews.map(review => review.userId)
    ))

    const users = await User.get({ ids: userIds })

    lastReviews.forEach(review => {
      const author = users.find(user => user.id === review.userId)

      review.user = {
        id: author.id,
        name: author.name
      }

      delete review.userId 
    })
  }

  return res.send({
    id: game.id,
    place: game.place,
    date: game.date, 
    home_team: {
      id: game.homeTeam.id,
      name: game.homeTeam.name,
      starting_players: game.startingPlayers && game.startingPlayers.homeTeam,
    },
    away_team: {
      id: game.awayTeam.id,
      name: game.awayTeam.name,
      starting_players: game.startingPlayers && game.startingPlayers.awayTeam,
    },
    events: game.events?.map(event => ({ 
      type: event.type,
      author: event.author,
      secondary_author: event.secondaryAuthor || undefined, 
      minute: event.minute,
    })),
    last_reviews: lastReviews
  })
}

exports.createGame = async (req, res) => {
  const { home_team, away_team, date, place } = req.body

  const game = new Game(
    place, 
    date,
    home_team,
    away_team  
  )

  const result = await game.save()

  if (result) {
    return res.status(200).json({
      message: "Jogo criado com sucesso",
      game: {
        id: game.id, 
        place: game.place,
        home_team: game.homeTeam,
        away_team: game.awayTeam,
        date: game.date
      }
    })
  }

  return res.status(400).json({
    error: {
      message: "Não foi possível criar o jogo"
    }
  })
}

exports.updateGameStartingPlayers = async (req, res) => {
  const { home, away } = req.body 
  const { id } = req.params 

  try {
    await Game.updateStartingPlayers(id, home, away)
  } catch (error) {
    res.status(500).send({
      error: {
        message: "Não foi possível atualizar os titulares do jogo"
      }
    })
  }

  return res.send({
    message: "Os titulares do jogo já foram atualizados"
  })
}

exports.addEvent = async (req, res) => {
  const { id } = req.params 
  const { type, author, minute, secondary_author } = req.body 

  const succeed = await Game.addEvent(
    id, { type, author, minute, secondary_author }
  )

  if (succeed) {
    return res.send({
      message: "Evento inserido com sucesso"
    })
  }

  return res.status(500).send({
    error: {
      message: "Não foi possível inserir o evento agora"
    }
  })
}

exports.finishGame = async (req, res) => {
  const { homeTeam, awayTeam } = req.body
  const { id } = req.params

  try {
    const result = await Game.finishGame(id, homeTeam, awayTeam)
    res.status(200).json({
      message: "Resultado do jogo gravado com sucesso",
      payload: result,
    })
  } catch(error) {
    console.error(error)
    res.status(500).json({
      message: "Erro finalizando jogo",
      error: error
    })
  }
}
