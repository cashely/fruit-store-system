const mongoose = require('../db.config');

const Fruits = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  statu: {
    type: Number,
    default: 1 // 1 - 正常
  },
  isCreated: {
    type: Boolean,
    default: true
  },
  creater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  mark: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

module.exports = mongoose.model('fruits', Fruits);
