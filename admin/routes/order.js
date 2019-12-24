const models = require('../model.js');
const moment = require('moment');
module.exports = {
  list(req, res) {
    const q = req.query;
    let conditions = {}
    if(q.createdAt) {
      conditions.createdAt = {$gte:q.createdAt}
    }
    console.log(conditions)
    models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').populate('puller').sort({_id: -1}).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      req.response(500, err);
    })
  },
  total(req, res) {
    const q = req.query;
    let conditions = {};
    if(q._k) {
      conditions.acount = new RegExp(q._k);
    }
    models.orders.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}
