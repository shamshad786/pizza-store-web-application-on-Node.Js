const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

const authController = () =>{
    const _getRedirectUrl = (req) =>{// ye code decide karega ki agar admin login h to admin ke order dashboard pr jaaye aur cutomer h customer ke order page pr jaaye
        return req.user.role ==='admin' ? '/admin/orders' : '/customers/orders'
    }
            return {
                login(req,res){// code h login page ko web pr show karega
                    res.render('auth/login');
                },

                postLogin(req,res,next){// ye code h jo user detail fill karega aur login karne pr data post karega database me

                        const {email, password} = req.body
                        //bina fields me kuch daale login karne pr validation
                        if(!email || !password){
                            
                            req.flash('error', 'All fields are required'); 
                            return res.redirect('/login');  
                        }

                    passport.authenticate('local',(err,user,info)=>{// ye authenticate karega konsi strategy hum use kar rahe h uske liye yaha 'local' passport-local use kar rahe h to pass kiya h
                                                                        // 'user' ke ander passport.js se user aa jayega jo 'done()' me define h
                                                                        // 'info' ke ander message show karne lagega wo hume 'done()' define kiya h passport.js file me 
                            if(err){// agar login me koi err h to ye kam karega msg show karega
                                req.flash('error', info.message)
                                return next(err)
                            }
                            if(!user){// agar user nahi h to  wo msg flash kar dega wo humne done() me define kiya h passport.js me
                                req.flash('error', info.message)
                                return res.redirect('/login')//aur user ko redirect kr dega login page pr hi
                            }
                            req.login(user,(err)=>{// aur error hoga to wo err me chala jayega aur error wala msg flash kr dega jo done() me fine h
                                if(err){
                                    req.flash('error', info.message)
                                    return next(err)
                                }
                                return res.redirect(_getRedirectUrl(req))// aur agar sab sahi rehta h to agar admin login karega to admin ke dashboard por jayega aur agar cutomer login karega to customer pr jayega
                            });
                    })(req,res,next)// passport.authenticate ye jo method h wo function call karta hai isliye jaha pr passport.authenticate method end hoga '()' kar ke usme req,res,next pass karte h
                },
                register(req,res){
                    res.render('auth/register');
                },
                async postRegister(req,res){
                    const {name, email, password} = req.body;// ye name,email,password register.ejs ke name attribute me se apne aap data yaha aa jaeyga
                    
                    //validation error hai ye ki data sahi aa rha h ya nahi agar error h to error ko show karna hai
                    if(!name || !email || !password){
                        req.flash('error', 'All Fields Required');// ye error tab show karega jab form filling me ko fields reh jata h 

                            req.flash('name',name)// ye form ko data ko erase nahi karega form me value attribute ko bhej dega taki koi fields chhut jaane se  data  wahi save rahega
                            req.flash('email', email)// ye dono data register.ejs me value attribute ko bhej rha hai

                            return res.redirect('/register');
                    }
                        // ye email ko check karega agar pahloe se to 'alreafy exist' ka msg flash karega
                        User.exists({email:email}, (err,result)=>{
                            if(result){
                                req.flash('error','Email Already exist');
                                req.flash('name',name);
                                req.flash('email',email);
                                return res.redirect('/register');
                            }
                        })

                        //hashpassword hume password database me direct save nahi karna hota hai usko bcrypt form save karna chahiye.

                            const hashedpassword = await bcrypt.hash(password,10);


                        //agar sab thk rehta h uper wale codes me to hume User create karna hai
                        const user = new User({
                                name:name,
                                email:email,
                                password:hashedpassword
                        })

                        user.save().then(()=>{// ye save() user ko database me save kar dega 
                            //login ko yaha baad se set karenge abhi home pr rediret kar rahe hai
                            return res.redirect('/');
                        }).catch(err => {
                            req.flash('error', 'Something went wrong');
                            return res.redirect('/register');
                        });

                   // console.log(req.body);
                },
                logout(req,res){// ye code user ko log karne ke liye 
                    req.logout()
                    return res.redirect('/login');
                }
            }
}

module.exports = authController;