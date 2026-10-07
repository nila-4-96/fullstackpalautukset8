const mongoose = require('mongoose')
const year = new Date().getFullYear()

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  published: {
    type: Number,
    max: year,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },
  genres: [{ type: String }],
})

module.exports = mongoose.model('Book', schema)