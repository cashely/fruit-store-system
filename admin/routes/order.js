const models = require('../model.js');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const excel = require('../functions/excel');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [], type } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = {};
    if(!!+type) {
      conditions.type = type
    }
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: moment(formatDate[1]).add(1, 'days').format('YYYY-MM-DD')}
      }
    }
    console.log(conditions)
    models.orders.find(conditions).populate('creater').populate('fruit').populate('unit').populate('pusher').populate('puller').sort({_id: -1}).skip((+page - 1) * limit).limit(+limit).then(orders => {
      req.response(200, orders)
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.orders.findById(id).populate('fruit').then(order => {
      req.response(200, order);
    }).catch(error => {
      req.response(500, error);
    })
  },
  back(req, res) {
    const { count, type, fruit, _id } = req.body;
    let total;
    if(type === 1) {
      total = count * -1
    } else if(type === 2) {
      total = count * 1
    }
    new models.backs({
      order: _id,
      count: count
    }).save().then(() => {
      const saveCountPromise = models.fruits.updateOne({_id: fruit._id}, {$inc: {total}});
      saveCountPromise.then((r) => {
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
  backs(req, res) {
    const { order } = req.query;
    let conditions = {
      order
    };
    models.backs.find(conditions).populate({
      path: 'order',
      populate: 'pusher puller'
    }).sort({_id: -1}).then(backs => {
      req.response(200, backs)
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
  },
  pay(req, res) {
    const { id}  = req.params;
    const { payNumber } = req.body;
    models.orders.findById(id).then(order => {
      const conditions = {
        $inc: {payNumber: payNumber * 1}
      }
      if(order.payTotal - order.payNumber === +payNumber) {
        conditions.payStatu = 2
      }
      return models.orders.updateOne({_id: id}, conditions)
    }).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  excel(req, res) {
    const { filename } = req.params;
    let downloadPath = path.resolve(__dirname, '..', 'downloads');
    if(!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
    downloadPath = path.resolve(downloadPath, filename);
    console.log(filename.split('.')[0].split('_'))
    let formatDate = filename.split('.')[0].split('_').map(item => {
      return moment(item).format('YYYY-MM-DD');
    });
    let conditions = {};
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: moment(formatDate[1]).add(1, 'days').format('YYYY-MM-DD')}
      }
    }
    models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').populate('puller').sort({_id: -1}).then(orders => {
      // req.response(200, orders)

      const data = [['水果名称', '数量（斤）', '创建时间', '创建人', '进出库', '出货方', '进货商', '支付金额（元）', '应付金额（元）']].concat(orders.map(order => ([
        order.fruit.title, order.count,
        moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        order.creater.acount, order.type === 1 ? '入库' : '出库',
        order.pusher && order.pusher.title,
        order.puller && order.puller.title,
        order.payNumber === 0 ? 0 : ((order.type === 1 ? '-' : '') + order.payNumber),
        (order.type === 1 ? '-' : '') + order.payTotal
      ])))
      excel(data, downloadPath);
      res.sendFile(downloadPath);
    }).catch(err => {
      req.response(500, err);
    })
  }
}
