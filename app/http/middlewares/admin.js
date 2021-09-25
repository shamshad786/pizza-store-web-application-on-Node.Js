function admin(req,res,next){
    if(req.isAuthenticated() && req.user.role ==='admin')// ye admin ke order dashboard pr tabhi jayega jab admin ke account se login hoga
    {
        return next()
    }
    return res.redirect('/')
}

module.exports = admin