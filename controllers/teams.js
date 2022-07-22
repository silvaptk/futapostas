const Team = require("../models/team")
const User = require("../models/user")

exports.getTeams = async (req, res) => {
  let teams 

  try {
    teams = await Team.get()
  } catch (error) {
    console.log(error)

    return res.status(500).send({
      error: {
        message: error.message 
      }
    })
  }


  return res.status(200).send(teams)
}

exports.getTeam = async (req, res) => {
  let team 

  try {
    team = await Team.get(req.params.id)
  } catch (error) {
    console.log(error)

    return res.status(500).send({
      error: {
        message: error.message
      }
    })
  }

  if (team.lastReviews) {
    const userIds = new Set(team.lastReviews.map(review => review.userId))

    const users = await User.get({ ids: Array.from(userIds) })

    team.lastReviews.forEach(review => {
      const author = users.find(user => user.id === review.userId)
      
      review.user = {
        id: author.id,
        name: author.name
      }

      delete review.userId
    })
  }

  return res.status(200).send({
    id: team.id,
    name: team.name, 
    players: team.players,
    statistics: team.statistics && {
      scored_goals: team.statistics.scoredGoals,
      played_matches: team.statistics.playedMatches,
      conceded_goals: team.statistics.concededGoals
    },
    last_reviews: team.lastReviews,
  })
}

exports.createTeam = async (req, res) => {
  const { name } = req.body 

  const team = new Team(name)

  try {
    await team.save()
  } catch (error) {
    return res.status(500).send({ error: { message: error.message } })
  }

  return res.status(200).send({
    id: team.id,
    name: team.name,
    statistics: {
      scored_goals: team.statistics.scoredGoals,
      played_matches: team.statistics.playedMatches,
      conceded_goals: team.statistics.concededGoals
    }
  })
}

exports.updateTeam = async (req, res) => {
  const { id } = req.params 
  const { name } = req.body 

  const team = await Team.update(id, { name })

  if (!team) {
    res.status(500).send({
      error: {
        message: "Erro ao alterar o time"
      }
    })
  }

  return res.send(team)
}