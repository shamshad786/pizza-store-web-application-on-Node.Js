const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user');
const bcrypt = require('bcrypt');

function init(passport){
    passport.use(new LocalStrategy({usernameField: 'email'},async (email,password,done)=>{
        //Login

        // check if email exist
        const user = await User.findOne({email: email})// ye use ko dhundega database se ki wo email hai ya hai database me
        if(!user){// ye condition dhundega ki agar user database me nahi h to wo 'done' function call kar dega.
                    //'done' 1st parameter 'null' leta hai 2nd parameter ek conditon leta hai 'true/false/true data' aur 3rd ek object leta h jisme hum error message user ko show kara sakte hai
            return done(null, false, {message: 'No user found with this email'});
        }
            bcrypt.compare(password, user.password).then(match =>{// aur yaha pr user ek mail ke pass password bhi check aur match karega jo ki databse me bycrypt form me hai
                                                                    //jab password match ho jayega to then me send kar dega
                if(match){// is condition me agar user ka email/password match ho jata hai to wo 'done()' ko call karega aur user ko send krega aur message succefully login ka dega
                    return done(null, user,{message: 'Logged in succesfully'})
                }
                return done(null, false, {message: 'Invalid Username or Password'});// ye code agar user name ya password galat dalta hai to wo yaha wala msg user ko send karega 
            }).catch(err =>{// ye code catch karega agar passport package me koi error aa jata h to.
                return done(null, false, {message: 'Something went wrong'});
            })
    }))

    passport.serializeUser((user,done)=>{// ye serializeUser isliye dete h ki jab user login ho jaye to data base ke session me user ka koi detail
                                            //save hota koi bhi detail save kr sakte hai email,username, etc. but hum yaha id save kar rahe hai
                                            //jisey ye pta rahega databse me konsa sa user online hai.
                done(null, user._id)
    })
    passport.deserializeUser((id,done)=>{// ye isliye use hota ki jo bhi data hum database ke session me user ka save kar rahe the wo kis tarah save karni hai
        User.findById(id,(err,user)=>{// ye database me user ko id ke through dhundega jo hume save kiya 2nd parameter 'err,user' diya hai
                                        //agar database se koi error aata hai to err me chala jaye aur sab sahi rha to user ka data milega
            done(err,user)
        })
    })

}

module.exports = init;