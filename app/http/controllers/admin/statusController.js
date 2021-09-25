const Order = require('../../../models/order');


function statusControiller(){// ye function bana rahe  hai taki admin order recieve karne baad uske order ko update kar sake ki order confirm, ya complete ho gya hai
                            
    return{
        update(req,res){// yaha pr resource/js folder ke ander jo 'admin.js' ki file uske markup ke ander se order ko 'place,confirm,complte' status update karne ke form ke help route pr 'method = POST' kar rahe hai aur us markup ke details ko yaha fetch kar rahe hai 
            
            
            // is Order ke ander ko 'orderId' h wo same resource/js ke ander admin.js ke ander dashbpard ka markup h usme 'name' attribute hai usme 'orderId' jo h wo yaha pr same hona chahiye hai tabhi hum server ke database se order.id ko match kar ke status ko update kar sakte hai aur 'status' ko update karna h to hum status ko database ke body ke ander se update kar rahe hai
            Order.updateOne({_id: req.body.orderId},{status: req.body.status}, (err, data)=>{// aur 'req.body.status' resource/js ke ander admin.js ke ander recieve kar ke usko database query ke ander update kar rahe hai  

                if(err){
                   return res.redirect('/admin/orders')
                }

                // Emit Event yaha pr event ko emit karenge jisko server.js me Emitter bind diya 'app.set('eventEmitter', eventEmitter)' ke ander kiya hai
                const eventEmitter = req.app.get('eventEmitter')// ye 'eventEmitter' wahi hona chahiye jo server.js me define h
                eventEmitter.emit('orderUpdated',{id: req.body.orderId, status: req.body.status})
               return res.redirect('/admin/orders')// aur is ko logic ko order karne par hi emit karna hai jab user order kare to isko humne emit /customer/ordercontroller.js me emit kiya hai
                
            })
        }
    }
}

module.exports = statusControiller;