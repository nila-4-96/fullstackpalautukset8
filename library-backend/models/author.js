const mongoose = require('mongoose')
const year = new Date().getFullYear()

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
    max: year,
  },
})

module.exports = mongoose.model('Author', schema)