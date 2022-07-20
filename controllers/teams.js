const Team = require("../models/team")

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

  return res.status(200).send({
    id: team.id,
    name: team.name, 
    players: team.players,
    statistics: {
      scored_goals: team.statistics.scoredGoals,
      played_matches: team.statistics.playedMatches,
      conceded_goals: team.statistics.concededGoals
    }
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

exports.updateTeam = (req, res, next) => {}

exports.deleteTeam = (req, res, next) => {}