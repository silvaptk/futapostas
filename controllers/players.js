const Player = require('../models/player');
const Review = require('../models/review');
const User = require('../models/user')

exports.getPlayers = async (req, res) => {
    const allPlayers = await Player.get()

    res.status(200).json(allPlayers)
}

exports.getPlayer = async (req, res) => {
  const { id } = req.params 

  const [player] = await Player.get([id])

  if (!Object.keys(player)) {
    return res.status(500).send({
      error: {
        message: "Não foi possível obter o jogador"
      }
    })
  }

  const lastReviews = await Review.get("player", id)

  if (lastReviews?.length) {
    const userIds = new Set(
      lastReviews.map(review => review.userId)
    )

    const users = await User.get({ ids: Array.from(userIds) })

    lastReviews.forEach(review => {
      const author = users.find(user => user.id === review.userId)

      review.user = {
        id: author.id,
        name: author.name,
      }

      delete review.userId
    })
  }

  return res.send({
    name: player.name,
    birth_date: player.birthDate,
    birthplace: player.birthplace,
    weight: player.weight,
    height: player.height,
    team: player.team,
    statistics: {
      played_games: player.statistics.playedGames,
      offsides: player.statistics.offsides
    },
    last_reviews: lastReviews
  })
}

exports.createPlayer = async (req, res) => {
  const { name, birthplace, birth_date, height, weight, team } = req.body

  const player = new Player(name, birth_date, birthplace, height, weight, team)

  const succeed = await player.save()

  if (!succeed) {
    return res.status(500).send({
      error: { 
        message: "Não foi possível inserir o jogador"
      }
    })
  }

  return res.send({
    message: "Jogador criado com sucesso",
    player,
  })
}

exports.updatePlayer = (req, res) => {}

exports.deletePlayer = (req, res) => {}
