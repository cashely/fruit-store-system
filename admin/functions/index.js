const Bignumber = require('bignumber.js');
module.exports = {
  multipliedBy: (a, b) => {
    return new Bignumber(a).multipliedBy(b).toString()
  },
  minus: (a, b) => {
    return Number(new Bignumber(a).minus(b).toString())
  }
}
