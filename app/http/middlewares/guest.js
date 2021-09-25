function guest(req,res,next){
        if(!req.isAuthenticated()){// ye code hai agar user login nahi h to sab thk h usko login, register page dikhega aur manually type kr ke jaa sakta hai
            return next()           //isAuthenticated() ye method passport ke wajah se mil rha h, ye apne aap recieve kar sakta h yaha pr
        }

        return res.redirect('/');// ye code h agar user login hai to wo login ,register page pr nahi jaa sakta manually type karne ke baad bhi
}   

module.exports = guest;