const models = require('../model.js');

module.exports = {
  units(req, res) {
    models.units.find().then(units => {
      req.response(200, units);
    }).catch(err => {
      req.response(500, err);
    })
  }
}
