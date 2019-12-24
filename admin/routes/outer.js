const models = require('../model.js');
const _ = require('lodash');
module.exports = {
  list(req, res) {
    let conditions = { type: 2 }
    if(req.createdAt) {
      conditions.createdAt = { $gte: moment(req.createdAt).format('YYYY-MM-DD')}
    }
    const orders = models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').sort({_id: -1}).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    let {fruit, pusher, price, payStatu, count, payNumber, outerUnit, outerCount} = req.body;
    let conditions = {
      type: 2,
      fruit,
      pusher,
      price,
      count,
      creater: req.user
    };
    const $payTotal = price * count; // 应付款项
    if(payStatu === 2) {
      payNumber = $payTotal
    }else if(+payNumber === $payTotal) {
      payStatu = 2
    }
    conditions.payStatu = payStatu;
    conditions.payNumber = payNumber;
    conditions.payTotal = $payTotal;
    if(outerUnit) {
      conditions.outerUnit = outerUnit
    }
    if(outerCount) {
      conditions.outerCount = outerCount
    }
    new models.orders(conditions).save().then(() => {
      const saveCountPromise = models.fruits.updateOne({_id: fruit}, {$inc: {total: count * -1}, outerPrice: price})
      saveCountPromise.then(() => {
        req.response(200, 'ok');
      }).catch(err => {
        req.response(500, err);
      })
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.orders.findById(id).then(order => {
      req.response(200, order);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.orders.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const {id} = req.params.id;
    const {pusher, price, payStatu} = req.body;
    const conditions = {
      title,
      unit,
      creater: req.user
    };
    models.orders.updateOne({_id: id}, conditions).then(() => {
      req.response(200, 'ok');
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
