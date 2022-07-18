exports.getPlayers = (req, res, next) => {
    const allPalyers = await Player.get()

    res.status(200).json(allPalyers)
}

exports.getPlayer = (req, res, next) => {}

exports.createPlayer = (req, res, next) => {}

exports.updatePlayer = (req, res, next) => {}

exports.deletePlayer = (req, res, next) => {}