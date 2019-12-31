const models = require('../model.js');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const excel = require('../functions/excel');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = {};
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: formatDate[1]}
      }
    }
    models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').populate('puller').sort({_id: -1}).skip((+page - 1) * limit).limit(+limit).then(orders => {
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
  },
  excel(req, res) {
    const { filename } = req.params;
    let downloadPath = path.resolve(__dirname, '..', 'downloads');
    if(!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }
    downloadPath = path.resolve(downloadPath, filename);

    const { page = 1, limit = 20, date = [] } = req.query;
    let formatDate = date.map(item => {
      return moment(JSON.parse(item)).format('YYYY-MM-DD');
    });
    let conditions = {};
    if(formatDate[0]) {
      conditions.createdAt = { $gte: formatDate[0]}
      if(formatDate[1]) {
        conditions.createdAt = { $gte: formatDate[0], $lte: formatDate[1]}
      }
    }
    models.orders.find(conditions).populate('creater').populate('fruit').populate('pusher').populate('puller').sort({_id: -1}).then(orders => {
      // req.response(200, orders)

      const data = [['水果名称', '数量', '创建时间', '创建人', '进出库', '金额']].concat(orders.map(order => ([
        order.fruit.title, order.count,
        moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        order.creater.acount, order.type === 1 ? '入库' : '出库',
        order.payNumber === 0 ? 0 : ((order.creater.acount, order.type === 1 ? '-' : '') + order.payNumber)
      ])))
      excel(data, downloadPath);
      res.sendFile(downloadPath);
    }).catch(err => {
      req.response(500, err);
    })
  }
}
