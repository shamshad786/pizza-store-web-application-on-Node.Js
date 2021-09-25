const axios = require('axios');
const Noty = require('noty');
const initAdmin = require('./admin');
const moment = require('moment');
import { initStripe } from './stripe'


let addToCart = document.querySelectorAll('.add-to-cart');// ye event listen kar rha hai button ko click karne pr pizza add karne ke liye
let cartCounter = document.querySelector('#cartCounter');// ye event kam kar rha h cart ke aagey number counter ko add karne ke liye
//let deleteCart = document.querySelector('#deleteCartButton');

function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res=>{
        
            cartCounter.innerText =  res.data.totalQty;
            new Noty({// ye pizza add karne pr notification aata h uske liye hai
                    type:'success',// ye color ko green karne ke liye hai
                    timeout: 1000,//ye 1 second ke baad apne aap notification gayab hone liye hai hai
                    text:'Item added to cart',
                   // layout: 'topLeft'
                    //progressBar: false
            }).show();
    }).catch(err => {
        new Noty({
                type:'error',
                timeout: 1000,
                text:'Something went wrong',
               // layout: 'topLeft'
                //progressBar: false
        }).show();
    });
}



addToCart.forEach((btn)=>{
        btn.addEventListener('click',(e) => {
                let pizza = JSON.parse(btn.dataset.pizza); // yaha pe json string form me data aa rha hai "data-pizza="<%= JSON.stringify(pizza) %>" home.ejs ke button ke ander se
                                                //home.ejs ke button ke data ko json string me get karne keliye yaha pr 'btn.dataset.pizza' keyword ka use karte hai aur 'pizza' naam diya jo button me data atrribute me set kiya hai
                                                // then yaha pr hume json sting form pizza ka data add ho paa rha hai click karne pr.but ye string hume json object me chahiye to hume 'JSON.parse(btn.dataset.pizza)' aise likhna hoga
   //             console.log(pizza);
                updateCart(pizza);

        });
});

// ye niche code h wo order place karne ke baad jo green notification alert h wo kuchh seconds ke baad gayab ho jayegi
const alertMsg = document.querySelector('#success-alert');
if(alertMsg){
        setTimeout(()=>{
                alertMsg.remove()
        },2000)
}

//ye jo function h wo database se order ke status ko receive kr ke custome ke order tracking page pr uske order status ke color ko change karega

let statuses = document.querySelectorAll('.status_line');
let hiddenInput = document.querySelector('#hiddenInput')
//let order = document.querySelector('#hiddenInput') ? document.querySelector('#hiddenInput').value : null // ye 'singleOrder.ejs' ke file ke ander se value aa rahi h jisko hum fucnction me receive kar rahe hai
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)// string form me data receive karne ke baad humne dubara json data ko object ke from me parse kr diya hai

let time = document.createElement('small') // ye tag html ka <small></small> tag create kiya h humne jiske ander time show hoga jab user ne order kiya tha

function updateStatus(order){

        statuses.forEach((status)=>{
                status.classList.remove('step-completed')
                status.classList.remove('current')

        })


let stepCompleted = true;
        statuses.forEach((status)=>{// current status jo 5 step me single order page pr uske uper loop ke through uska status change kiya hai perticular fiels ko identify karne ke liye humne  singleOrder.ejs me 'li' element ko data atrribute ke through get kiya hai
                let dataProp = status.dataset.status // ye data atrribute ko get kar rha hai 'singleOrder.ejs' ke file me aur data ke baat jo status likha hai 'data-status' us status ke specific field ko get kiya 'dataset.status' aise likh ke
                if(stepCompleted){
                        status.classList.add('step-completed')// ye class humne bana ke css me rakha hai jaise hi status update hoga uske uper class add ho jayega jo css me define h fir uska color change hoga uske status ke according

                }
                if(dataProp === order.status){
                        stepCompleted = false; // step complete hone ke baad usko false kr diya hai 
                        time.innerText = moment(order.updatedAt).format('hh:mm A')// yaha moment ke through hum time ko database se get kar rahe
                        status.appendChild(time)// yaha humne list element ke ander <small> tag ko append kr diya h mean jod diya hai
                        if(status.nextElementSibling.classList.add('current')){ // ye 'nextElementSibling' ye method singleOrder page ke 'li' element ke next wale element ko get karta hai

                         }
                }
        })
}

updateStatus(order);


// ye stripe payment ka function jisko alag file likh ke yaha pr export kiya hai yaha usko import kar ke call kiya hai wo sara code yaha execute ho jayega
initStripe()


// yaha pr socket io ka logic hoga live update ke liye but ye browser side ka code h isko use karne ke layout.ejs file me socket.io ko import karna hoga script tag me waha kiya h dekh sakte hai
 let socket = io()
 

 //join , yaha pr ye private room create kar dega taki har ek orderid ka room bana ke join kar dega room me 
 if(order){
        socket.emit('join',`order_${order._id}`)// ye order id humpass kar rahe jo upper order get kiya tha ejs file se hidden input ke ander se aur uske ander id h jissye har id ka room separate banega
 }

//ye admit dashboard pr order ko real time send karne ke liye logic h jab bhi koi user order karega to admin ko order detail real time me mil jayega bina page refresh kiye
let adminAreaPath = window.location.pathname // ye admin ke dasahboard ke path ko find kr ke identify karne ke liye hai ki ye admin dashboard hai
//console.log(adminAreaPath);
if(adminAreaPath.includes('admin')){// ye condtion me hum check kar rahe hai agar admin path ke string me 'admin' hai 'usko dhundne ke liye hum include() ka use kar sakte hai string ke uper' to socket io ka admin ka room bana dega
       
        initAdmin(socket)
        socket.emit('join','adminRoom')// aur is adminRoom ko pass kr karne ke liye socket ka logic already server js me humne define kar diya hai aur ab iska logic hum admin.js ke file me likha hai

}



 socket.on('orderUpdated',(data)=>{// ye jo yaha pr event listen kiya h isko server.js file me is event  ko banaya hai
        const updatedOrder = { ...order }// ye hum order ko update karne ke liye yaha order ko copy kiya h '{...order}' aise hum order ko copy kar sakte hai
        updatedOrder.updatedAt = moment().format()// yaha hum order ke time ko update kar rahe h jab bhi order ka status update hoga
        updatedOrder.status = data.status // ye jo data yaha receive ho rha h wo server.js ke last wale event me se ho rha h jo waha pr data hai
        //console.log(data);
        updateStatus(updatedOrder)// ye 'updateStatus' h jo single order ke page ke order status ke color ko change karta h uske ander updateOrder ko paas kiya h taki realtime status update ho bina page refresh hue
        new Noty({// ye pizza add karne pr notification aata h uske liye hai
                type:'success',// ye color ko green karne ke liye hai
                timeout: 1000,//ye 1 second ke baad apne aap notification gayab hone liye hai hai
                text:'Order Updated',
               // layout: 'topLeft'
                //progressBar: false
        }).show();
})
 
