const models = require('../model.js');
module.exports = {
  list(req, res) {
    const conditions = {}
    models.fruits.find(conditions).populate('creater').then(fruits => {
      req.response(200, fruits)
    }).catch(err => {
      req.response(500, err);
    })
  },
  add(req, res) {
    const {title, unit, warn, min} = req.body;
    const conditions = {
      title,
      unit,
      warn, min,
      creater: req.user
    };
    new models.fruits(conditions).save().then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  detail(req, res, next) {
    const id = req.params.id;
    models.fruits.findById(id).then(fruit => {
      req.response(200, fruit);
    }).catch(error => {
      req.response(500, error);
    })
  },
  delete(req, res) {
    const {id} = req.params.id;
    models.fruits.deleteById(id).then(() => {
      req.response(200, 'ok');
    }).catch(err => {
      req.response(500, err);
    })
  },
  update(req, res) {
    const id = req.params.id;
    const {title, unit, warn, min} = req.body;
    const conditions = {
      title,
      unit,
      warn,
      min: +min,
      creater: req.user
    };
    console.log(conditions, id)
    models.fruits.findOneAndUpdate({_id: id}, conditions).then(() => {
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
    models.fruits.countDocuments(conditions).then(count => {
      req.response(200, count);
    }).catch(error => {
      req.response(500, error)
    })
  }
}
