const models = require('../model.js');
module.exports = {
  list(req, res) {
    const { page = 1, limit = 20, title = '' } = req.query;
    const conditions = {
      title: new RegExp(title, 'ig')
    };
    models.units.find(conditions).populate('creater').skip((+page - 1) * limit).limit(+limit).then(units => {
      req.response(200, units)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title} = req.body;
    const conditions = {
      title,
      creater: req.user.uid
    };
    new models.units(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.units.findById(id).then(fruit => {
      req.response(200, fruit);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params;
    models.units.deleteOne({_id: id}).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      console.log(err)
      req.response(500, err);
    })
  },
  update(req, res) {
    const id = req.params.id;
    const {title, unit, warn, min, total = 0} = req.body;
    const conditions = {
      title,
      unit,
      warn,
      total: +total,
      min: +min,
      creater: req.user.uid
    };
    models.units.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.units.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}
