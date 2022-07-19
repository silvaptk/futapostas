const Bet = require('../models/bet');

exports.getBets = (req, res, next) => {}

exports.getBet = (req, res, next) => {}

exports.createBet = async (req, res) => {
    const { email, tipoAposta, resultado, valor, jogo_id } = req.body 
    const newBet = new Bet(
        email, 
        tipoAposta,
        resultado,
        valor,
        jogo_id
    )

    const result = await newBet.save()

    if (result) {
        return res.status(200).json({
        message: "Aposta criada com sucesso",
        payload: newBet
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