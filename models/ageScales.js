const mongoose = require('mongoose');

const agesScalesSchema = mongoose.Schema({
  id: {
    type: Number,
  },
  text: {
    type: String,
  }
});

module.exports = mongoose.model('AgesScale', agesScalesSchema);