const Order = require('../../../models/order');
const moment = require('moment');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)



function orderController(){
    return {
        store(req,res){
           // console.log(req.body);
           const {phone,address,stripeToken, paymentType} = req.body//user fields nahi bharta hai to.. ye fields ka data cart.ejs ke phone aur address wale section se aa rha hai, yaha isko validation kiya agar user details nahi bharta hai to usko error aa jayega.
           if(!phone || !address)
           {
                return res.status(422).json({message: 'All fields are required'});// ye jum ajax call se orderPlced kiya h to uska response yaha server se hum ajax form me hi bhej rahe hai
                //req.flash('error', 'All fields are required') //in dono lines ko isliye hataya h kyu hum response ko ajax call se success ya erro bhej rahe hai
                //return res.redirect('/cart')
           }
                    // ye code se hum agar koi err nahi h ho order create kar rahe hai
                    const order = new Order({// jab user apni details sahi deta h to ye data databse me save ho jayega is fields me customerId,items passport ki help se data le leta hai
                        customerId: req.user._id,
                        items: req.session.cart.items,
                        phone: phone,
                        address: address
                    })
                    order.save().then((result)=>{// order button click karne ke baad ye cart ke saare pizza ka order data bas me save kar dega
                      
                        //ye  code order ko database ke ander store kar raha hai
                      Order.populate(result,{path: 'customerId'},(err, placedOrder)=>{// ye 'Order' database hai iske ander se cutomerId ki saari detail object ke form me dega aur 'placedOrder' me customer ki order details aa jayegi jisko admin.js me markup ke ander 'order.customerId.name' kar ke sirf customer ka naam get kar sakte hai
                        //req.flash('success', 'Order placed successfully')
                      
                        //stripe Payment -> yaha pr hum order save karne ke baad payment lenge

                        if(paymentType === 'card'){ // ye logic bana rahe jab payment type card hoga to niche wale code run kar jayenge
                            stripe.charges.create({ // yaha charges ka stripe ka method call kiya hai iske ander object ke form data get kar ke database me save kar rahe h ki paymet card se hui ya nahi
                                amount: req.session.cart.totalPrice * 100,// yaha pr 1 rupee ko 100 se miultiply kiya jiska matlab 100 paise hai
                                source: stripeToken,// ye stripke ka send kar rahe h stripe ko jo client side pr get kiya tha
                                currency: 'inr',// ye country ke according currency di h stripe bahut saare currency ko accept karta h documentation me padh ke yaha dena hoga
                                description: `pizza order: ${placedOrder._id} & Customer name: ${placedOrder.customerId.name},customer mobile no: ${placedOrder.phone},customer email: ${placedOrder.customerId.email}`// ye description stripe ke dashboard pr define karega ki kis order id ka payment hai aur fir baad me usko refunf karne ke baad me help hogi

                            }).then(()=>{
                                placedOrder.paymentStatus =  true;// yaha pr payment status ko by default false kiya order ke modal schema me fir jab order successfull ho jata h to yaha pr us paymentStatus ko true kiya h fir uske result ko then block me cathc kar liya hai
                                
                                placedOrder.paymentType = paymentType;// ye payment type ko 'COD','CARD' auto select kar ke database me change kar dega jo bhi use r choose karega

                                placedOrder.save().then((ord)=>{// yaha pr order complete hone ke baad database me usko save kar liya hai
                                    //console.log(ord);
                                
                                        //ye event isliye h ki user order karte hi live order receive ho jaye admin ke dashboar pr jo humne 'adminRoom' ke socket banaya hai aur ab is room ko aur event ko emit kar rahe server.js me
                                            const eventEmitter = req.app.get('eventEmitter')// ye event hum tab emit kar rahe jab order placed ho jayegi aur iska listen karne ke liye server.js me logic likha hai
                                             eventEmitter.emit('orderPlaced', ord)// ye 'ord' customer ke order ki details aa rahi jisko humne admin.js me listen kiya hai
                                             delete req.session.cart
                                             return res.json({message: 'Payment Accepted, Order placed successfully'})//9.) yaha pr hum ajax call send kar rahe to response me hum json me karna hota hai
                                }).catch((err)=>{
                                    console.log(err);
                                })

                                
                            }).catch((err)=>{
                                console.log(err);
                                delete req.session.cart // ye order place karne ke baad cart ko delete kar deta hai
                               return res.json({message: 'Order Placed but payment failed, you can pay at delivery time '});
                            })
                        }else{
                            delete req.session.cart // ye order place karne ke baad cart ko delete kar deta hai
                            return res.json({message: 'COD Order Placed Successfully'})
                        }
                        //return res.redirect('/customers/orders')
                      })
                        

                    }).catch((err)=>{
                        return res.status(500).json({message: 'Something went wrong'}); // ye hum ajax call use kiya h to normally redirect nahi kar sakte the usko hume json response dena hoga server se
                        // req.flash('error','Something went wrong')
                        // return res.redirect('/cart')
                        
                    });
        },
       async index(req,res){// ye logic isliye bana rahe h taki databse se orders fetch kar ke '/customers/orders ke page pr dikh sake
            const orders = await Order.find({customerId: req.user._id},// ye login user ka logic h yaha hum login user ka data fetch kar rahe hai
                null,{sort:{'createdAt': -1}})// ye code decending order me orders list karne ke liye niche se uper latest orders uper aayenge aur purane niche hote jayenge
               
               res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate,max-stale=0, post-check=0, pre-check=0')// ye code customer order karne ke baad 'order place successfully' notification aata agar back kr ke dubara customer order page pr jata hai wo baar dikhta tha usko hatane ke liye ye code h
               
                res.render('customers/orders',{orders: orders, moment: moment})// ye order ejs ke frontend pr bhej rha h yahi "orders" variable humne waha pr use kiya h orders.ejs ke table me
           // console.log(orders);
        },
        async show(req,res){
            const order = await Order.findById(req.params.id)// ye order ki id hum database se fetch kr rahe hai, 
            
            //Authorise user, yaha ye condition banaya hai ki jo order ki update detail show hogi wo current user ki h ya nahi agar usi user ki id h to wo status ko update hote dekh sakta aur agar nahi h to wo nahi dekh sakta
            if(req.user._id.toString() === order.customerId.toString()){// yaha pr humne compare kiya kiya h ki user ki jo id h wo customeId se match ho rahi h ya nahi agar but humne yaha pr 'toString()' method call kiya h kyu ki database ke ander id 'objectId' ke form me hota hai aur object id ko hum direct compare nahi kar sakte usko pehle string form me change karna hoga isliye 'toString()' method ko call kiya hai aur jab dono id same tabhi status update ka page dikhe
               return res.render('customers/singleOrder.ejs',{order})// ye page ko render ke baad jo order data humne database fetch kiya h usko singleOrder.ejs ke page pr send kr ke show kar rahe hai
            }
            return res.redirect('/');
        }

    }
}
module.exports = orderController;