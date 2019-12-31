const models = require('../model.js');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = { type: 1 };
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: formatDate[1]}
      }
    }
    const orders = models.orders.find(conditions).populate('creater').populate('fruit').populate('puller').sort({_id: -1}).skip((+page - 1) * limit).limit(+limit).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  add(req, res) {
    let {fruit, puller, price, payStatu, count, payNumber} = req.body;
    let conditions = {
      type: 1,
      fruit,
      puller,
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
    new models.orders(conditions).save().then(() => {
      const saveCountPromise = models.fruits.updateOne({_id: fruit}, {$inc: {total: count * 1}, innerPrice: price});
      saveCountPromise.then((r) => {
        console.log(r)
        req.response(200, 'ok');
      }).catch(err => {
        console.log(err)
        req.response(500, err);
      })
    }).catch(err => {
      console.log(err)
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
    const id = req.params.id;
    const {price, pusher, payStatu} = req.body;
    const conditions = {
      price,
      pusher,
      payStatu,
      creater: req.user
    };
    models.orders.updateOne({_id: id}, conditions).then((r) => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  total(req, res) {
    const { date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = { type: 1 };
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: formatDate[1]}
      }
    }
    models.orders.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}
