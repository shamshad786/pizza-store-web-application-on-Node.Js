const homeController = require('../app/http/controllers/homeController');
const authController = require('../app/http/controllers/authController');
const cartController =  require('../app/http/controllers/customers/cartController');
const orderController = require('../app/http/controllers/customers/orderController');
const AdminOrderController = require('../app/http/controllers/admin/orderController');
const statusControiller = require('../app/http/controllers/admin/statusController');


const admin = require('../app/http/middlewares/admin');// ye admin ke dashboard ka protection middleware h cutomer nahi jaa payega sirf admin hi jaa sakta hai
const guest = require('../app/http/middlewares/guest');// ye middleware isliye banaya ahi taki user login hone ke baad manually type kr registe,login page pr naa ja sake.
const auth = require('../app/http/middlewares/auth');// ye middleware isliye bana rahe taki jo bhi protected routes h only loggedin user jaa sakta h 
                                    // yaha pe saare routes hai , routes ke ander hum logic likhnege to code bada ho jayega isliye,
                                    //'homeController,authController' file banaya h taki ki logics waha pr rahe taki code clean dikhe 
                                    //aur us file yaha routes me call kiya hai

function initRoutes(app){
    app.get('/',homeController().index);

    app.get('/cart',cartController().index);
    app.post('/update-cart',cartController().update);

    app.get('/login',guest,authController().login);//ye page ko render karne ke liye hai
    app.post('/login',authController().postLogin);//aur ye login page se user ke data ko bhejne ke liye hai

    app.post('/logout',authController().logout);// ye logout ke function ko call kiya hai

    app.get('/register',guest,authController().register);
    app.post('/register',authController().postRegister);

   //customer routes
   app.post('/orders',auth,orderController().store )// ye order page ke liye routes hai jo ki jo order button click karne ke baad user ko roder page pr le jayega
   app.get('/customers/orders',auth,orderController().index)// ye route hai customer order page pr le jane ke liye aur uske saare logics iske ander define ki customer order karne ke baad apne order ko dekh sake 
   app.get('/customer/orders/:id',auth,orderController().show)// ye route h customer ke order status ke page pr le jaa ke check karne ke liye uska order 'confirm,prepare,complete' hua ki nahi wo apne order ke status ko live dekh sakta hai ki kya status h

   //admin routes
   app.get('/admin/orders', admin,AdminOrderController().index);// ye admin ke dashboard ka route aur logic ki customer ke order karne ke baad admin ke dashboard pr chala jayega h
   app.post('/admin/order/status', admin, statusControiller().update)// ye route hai h admin order receive karne ke baad uske status ko update kr sake


    app.get('*',(req,res)=>{        //ye page not found ka route hai jisme mene universal path '*' diya hai
    res.render('error');
    });
}


module.exports = initRoutes; 