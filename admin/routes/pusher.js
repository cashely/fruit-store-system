const models = require('../model.js');
module.exports = {
  list(req, res) {
    const conditions = {}
    models.pushers.find(conditions).populate('creater').sort({updatedAt: -1}).then(pushers => {
      req.response(200, pushers)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, statu, contact, address, tel,} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      creater: req.user
    };
    new models.pushers(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.pushers.findById(id).then(pusher => {
      req.response(200, pusher);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.pushers.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const id = req.params.id;
    const {title, statu, contact, address, tel,} = req.body;
    const conditions = {
      title,
      statu,
      contact, address, tel,
      creater: req.user
    };
    models.pushers.updateOne({_id: id}, conditions).then(() => {
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
    models.pushers.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}
