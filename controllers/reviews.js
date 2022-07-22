const Review = require("../models/review")

exports.createReview = async (req, res) => {
  const { comment, type, reference } = req.body
  
  const review = new Review(
    comment,
    type,
    reference,
    req.user.id
  )

  const succeed = await review.save()

  if (succeed) { 
    return res.send({
      message: "Resenha criada com sucesso",
      review 
    })
  }

  return res.status(500).send({
    error: {
      message: "Não foi possível criar a resenha",
    }
  })
}

exports.updateReview = (req, res) => {}

exports.deleteReview = (req, res) => {}