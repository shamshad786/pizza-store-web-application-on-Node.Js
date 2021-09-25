import { loadStripe } from '@stripe/stripe-js'
import { placeOrder } from './apiService';


export async function initStripe(){

    const stripe = await loadStripe('pk_test_51Jc26ESGWbiY5EihxS2JAIwC4XMOn7g9crUorOEariZyUcz6b1RSJ8J8gRTdLYzJH8DjgRPWUrJJTzc7jVwioGRU00bNwvtTP1');// ye stripe ka API key hai jo ki humne stripe.com se mili hai

    let card = null;

    function mountWidget (){

        const elements = stripe.elements()// ye elements isliye hote hai kyu ki jab user pay karega card se to waha pr jo button widget dikha usko lagane ke liye use karte hai

    let style = {
        base:{
            color: '#32325d',
            fontFamily: '"Halvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize:'16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid:{
            color: '#fa755a',
            iconColor:'#fa755a'
        }
    };

   card = elements.create('card',{style:style, hidePostalCode:true})
    card.mount('#card-element')// ye button ko browser pr laga dega humne yaha id di h ki button kaha lagana hai humne uski id yaha di jo card.ejs me hai
    }

    const paymentType = document.querySelector('#paymentType')
    if(!paymentType){// ye isliye taki eventlistner ka error home page pr naa aye
        return;
    }
    paymentType.addEventListener('change',(e)=>{
        console.log(e.target.value);
        if(e.target.value === "card"){
            //display payment field
            mountWidget()// ye card ke field ko 
        }else{
            //COD select karne pr payment field ko destroy kar dega
            card.destroy();
        }
    })



//Ajax-Call for payment intigration
//1.) payment-form intergrate kar ke liye logic h yaha cart.ejs ke phone, address ko ajax call ke thorugh server pr send karenge.
const paymentForm =  document.querySelector('#payment-form');

if(paymentForm){
        paymentForm.addEventListener('submit',(event)=>{
                event.preventDefault();//2.) ye preventDefault() isliye hai ki jab bhi order submit karenge tab cart.ejs se to wo data ko /orders pr na bheje sirf event listen kare
                
                let formData = new FormData(paymentForm)//3.) ye javascript ka default class h isko yaha hum object banane ke liye kr sakte h
        
                let formObject = {} //4.) yaha pr humne jo bhi cart ke order page me phone,address put kiya object me get kiya hai
        
                for(let [key,value] of formData.entries()){//5.) aur yaha pr loop ke ander key ke variable ko [key] destructure kar ke sirf name get kar liya hai dono input fields air us object ke ander jo bhi details h usko entries() ke help se extract kr liya h
                        // 5.1) aur key sath humne yaha uske value ko bhi destructure kr ke get kar liya hai jo user put kar rha hai
                        formObject[key] = value // 6.) aur yaha pr jo bhi details extract kiya tha destructure kar ke usko key value pairs me store kar liya
                }
        
                if(!card){
                    placeOrder(formObject); // ye function tab kam karega jab hum COD se order karenge aur normally ajax call ke details post kar dega aur is function ke ander form ki details jo object ke me get kiya tha usko yaha se send kar de apiService.js ke function me taki form ke data ko post kar sake
                   // console.log(formObject);
                    return; // aur COD ka sab pattern sahi rha to ye normally ajax call ke COD order ho jayega aur wahi return ho jayega niche card wale logic pr nahi jayega
                }

                //verify card yaha pr jab card se payment karenge to ye request karega stripe ko aur wo return me token dega
                stripe.createToken(card).then((result)=>{// aur jab card se payment karega to ye code stripe ke server pr request send kr dega aur result me hume token id mil jayegi
                    //console.log(result);
                    formObject.stripeToken = result.token.id;// yaha pr humne 'pay with card' ke token ko receive kiya hai aur usko 'formData' ke object ke ander 'stripeToken: toke.id' is tarah se uski id di hai jab bhi saare fields sahi info hoga to 'placeOrder(formData)' call ho jayega aur order place ho jayega.
                    placeOrder(formObject)// ye jab tab call hoga jab uper 'formData' ke ander saare info receive ho jayega.
                }).catch((err)=>{
                    console.log(err);
                });                
        });
}

}

// module.exports = initStripe;