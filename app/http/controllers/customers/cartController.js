const cartController = () =>{
    return{
        index(req,res){
            res.render('customers/cart');
        },
        update(req, res){

            if(!req.session.cart){// ye code database first me request jayegi agar waha cart nahi hoga to databse me cart ko create kar dega
                req.session.cart = {//aur us cart ka basic object structure aise bana dega jaise if condition define kiya hai
                    items: {},
                    totalQty:0,
                    totalPrice:0
                } 
            }
            let cart = req.session.cart

            if(!cart.items[req.body._id]){// ye code agar cart me koi pizza nahi h to pizza aur uski price ko addd kar dega.
                cart.items[req.body._id]={
                    item: req.body,
                    qty:1
                }
                cart.totalQty=cart.totalQty +1; // ye total quantity me ek aur add kar dega hai
                cart.totalPrice = cart.totalPrice + req.body.price;// aur ye cart ki tottal price add kar dega jitne bhi cart me pizza h
            }else{
                cart.items[req.body._id].qty = cart.items[req.body._id].qty+1;//aur ye cart me jtine pizza hai unke quantity ko add karega 
                cart.totalQty = cart.totalQty + 1; // ye cart ki total quantity me ek aur add karega jab bhi pizza add karenge
                cart.totalPrice = cart.totalPrice + req.body.price;// ye total quantity ke hisab se price add kar dega.
            }
            return res.json({totalQty: req.session.cart.totalQty});
        }
    }
}

module.exports = cartController;