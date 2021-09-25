const { populate } = require("../../../models/order")
const order = require("../../../models/order")

function orderController (){
    return {
        index(req,res){
            order.find({status: { $ne: 'completed'}},// ye is code me wo orders ke list dega admin dashboard ko completed nahi hai
            null,{ sort:{'createdAt': -1}}).populate('customerId','-password').exec((err,orders)=>{//populate function isliye call kiya taki taki admin dashboad me user ka id ki jagah uska naam dikhe aur '-password' likhne se password field ka data nahi aayega populate() me
               
                if(req.xhr){
                    return res.json(orders)// ye order ko json format ke get karne ke liye likha hai
                }
                else{

                    return res.render('admin/orders')
                }
            })
        }
    }
}


module.exports = orderController;