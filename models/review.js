const postgres = require("../databases/postgres")
const redis = require("../databases/redis")
const { ReviewsPageSize } = require("../util/constants")

class Review {
  constructor (comment, type, reference, userId) {
    this.comment = comment
    this.type = type 
    this.userId = userId 
    this.reference = reference
    this.date = new Date().toISOString()
  }

  static async get (type, reference, page) {
    if (!page) {
      try {
        const result = await postgres.query(`
          SELECT 
            numero_de_resenhas 
          FROM 
            ${typeMap[type]} 
          WHERE id = ${reference}
        `)

        const reviewsNumber = Number(result[0]["numero_de_resenhas"])

        if (!reviewsNumber) {
          return []
        }

        page = Math.floor(reviewsNumber / ReviewsPageSize) + 1
      } catch (error) {
        console.log(error)
      }
    }

    try {
      const result = await redis.get(
        `${type}-${reference}-reviews-${page}`
      )

      const reviews = JSON.parse(result).map(item => ({
        comment: item["comentário"],
        date: item["data"],
        likes: item["curtidas"],
        userId: item["códigoUsuário"],
        reference: item["referência"],
        type: item["tipo"]
      }))

      return reviews 
    } catch (error) {
      console.log(error);
    }

    return null 
  }

  getPageKey (pageNumber) {
    return `${this.type}-${this.reference}-reviews-${pageNumber}`
  }

  async save () {
    let reviewsNumber = 0

    try {
      const result = await postgres.query(`
        SELECT 
          numero_de_resenhas 
        FROM 
          ${typeMap[this.type]}
        WHERE id = ${this.reference}
      `)

      reviewsNumber = result[0]["numero_de_resenhas"] || 0
    } catch (error) {
      console.log(error)

      return false 
    }

    let lastReviewsPage = []
    const lastReviewsPageNumber = Math.floor(reviewsNumber / ReviewsPageSize) + 1

    if (reviewsNumber % ReviewsPageSize) {
      try {
        lastReviewsPage = JSON.parse(await redis.get(
          this.getPageKey(lastReviewsPageNumber)
        ))
      } catch (error) {
        console.log(error)

        return false 
      }
    }

    lastReviewsPage.push({
      "referência": this.reference,
      "comentário": this.comment,
      "data": this.date,
      "tipo": this.type,
      "códigoUsuário": this.userId,
      "curtidas": 0
    })

    try {
      await redis.set(
        `${this.getPageKey(lastReviewsPageNumber)}`,
        JSON.stringify(lastReviewsPage)
      )
    } catch (error) {
      console.log(error)

      return false 
    }

    try {
      await postgres.query(`
        UPDATE 
          ${typeMap[this.type]} 
        SET 
          numero_de_resenhas = numero_de_resenhas + 1 
        WHERE id = ${this.reference}
      `)
    } catch (error) {
      console.log(error)

      return false 
    }

    return true 
  }

  static async update () {

  }

  static async delete () {

  }
}

const typeMap = {
  player: "jogador",
  team: "time",
  game: "jogo"
}

module.exports = Review 