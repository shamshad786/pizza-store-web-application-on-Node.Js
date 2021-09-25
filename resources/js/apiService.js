import axios from 'axios'
 import Noty from 'noty'

export function placeOrder(formObject){
    axios.post('/orders', formObject).then((res)=>{//7.) yaha pr object key value get karne ke baad humne key aur value ko cart.ejs ke url pr data ko send kar kiya h aur response ko callback function me get kiya hai
        new Noty({//10.) ye notification show karega jab order sucessful placed ho jayega
                type:'success',
                timeout: 1000,
                text: res.data.message, 
        }).show();
        setTimeout(()=>{// 11.) yaha tofication thoda sa dikhta isliye 1  second page redirect ko delay kiya hai

                window.location.href = '/customers/orders';//12.) ye hum path set kar krahe h jab server se success aayega order ka to redirect kr rahe h customer ke order page pr

        },1000)
       
      
        // console.log(res.data);//8.) data dekhne ke liye res.data likhna hota h. iske baad hume server pr logic likhna h /customer/orderController.js
}).catch((err)=>{
        new Noty({//10.) ye notification show karega jab order sucessful placed ho jayega
                type:'success',
                timeout: 1000,
                text: err.res.data.message, 
        }).show();
        console.log(err);
})

console.log(formObject);

}