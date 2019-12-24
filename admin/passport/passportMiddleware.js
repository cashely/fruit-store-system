module.exports = () => {
  return (req, res, next) => {
    if(req.isAuthenticated()) {
      return next()
    }
    res.json({
      code: 302,
      message: '未登录'
    })
  }
}
