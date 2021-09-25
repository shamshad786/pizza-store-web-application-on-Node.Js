// ye middleware isliye bana rahe taki jo bhi protected routes h only loggedin user jaa sakta h 

function auth (req,res,next){
    if(req.isAuthenticated()){ // ye isAuthenticated() passport.JS se mil jata h aur ye batata h ki user login h ya nahi hai
        return next()// ye next isliye call kiya h agar user login h to next() call kar do user ko kahi jaane dega
    }
    return res.redirect('/login'); // aur agar user login nahi h to usko login page pr bhej dega
}

module.exports = auth;