require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const  Emitter = require('events');
 


//Database Connection

mongoose.connect(process.env.MONGO_CONNECTION_URL,{
   
    useNewUrlParser: true,
    useUnifiedTopology: true,
   
}).then( ()=>{
    console.log("Database Connected");
}).catch((err)=>{
    console.log('Failed to Connect Databse: '+err);
});

//Event Emitter ki jarurat isliye hota hai ki agar kahi pr koi method ya task complete ho jata h to uske kisi aur jagah listen kar ke use kiya jaa sakta hai
// aur jo same 'eventEmitter' yaha banaya h usko same name se hi status controller me use karna taki hum usko waha use kar sake
const eventEmitter = new Emitter()// ye event isliye bana rahe taki admin ke status controller file ke ander event ke trhough socket ko pass kar sake
app.set('eventEmitter', eventEmitter)





// session config

 // session ek middleware ki tarah kam karta hai  aur session me hum cart ke data ko store karenge. 
 //but seesion ko use karne ke liye hume cookies ki jarurat hoti hai bina cookies ke seession use nahi hota. 
//aur cookies ko encrypt karne ke liye hume secret key ki jarurat hoti hai isliye .env file me cookie ka secret key. 
//bana ke yaha pr use kiya hai taki baad me cookies ko encrypt kr sake.
app.use(session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
       store: MongoDbStore.create({
           mongoUrl: process.env.MONGO_CONNECTION_URL
       }),
        saveUninitialized: false,
        cookie: {maxAge: 1000 * 60 * 60 * 24}//ye 24 hours hai ye session ko 24 ghante ke liye store karega
      // cookie: {maxAge: 1000 * 15} ye 15 seconds ke liye hai
}));

//passort config for login
const passportInit = require('./app/config/passport'); // ye code database ke local userdata ko use kar ke login karta hai ye ek middleware hai
const { Socket } = require('dgram');
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

//session ko databse se use karne ke liye flah package ki jarurrat hoti hai flash middleware ki tarah kam karta hai
app.use(flash());

//Assets
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));// ye form ke register data ko encode karta hai body ke ander jo bhi data hota hai
app.use(express.json());

//Global middleware 

app.use((req,res,next)=>{
     res.locals.session = req.session// is middleware ko isliye banaya h kyu 'layout.ejs' me seesion define nahi hota hai isliye global middleware bnaya hai
     res.locals.user =  req.user// ye user globally define kr diya taki ejs ke kisi bhi file me user ke data ko send kr paaye
     next();   
});


// set templates
app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);// yaha pe web.js ke function ko call kiya hai taki uske ander 'app' ko pass kar ke web.js me routes ke parameters ko use kar sake





const PORT = process.env.PORT || 3000;
const server = app.listen(PORT,()=>{
    console.log(`Server Running on ${PORT}`);
})


//Socket.io yaha per setup karenge socket.io ko real time data ko send aur get karne ke liye use kiya jata hai

const io = require('socket.io')(server) // socket.io ko require karne ke baad ek function recieve ho jata hai usko call karne ke baad usme hum server ko daal dete h kyu ki isko ek server ki jarurat padti h jispe ye run karega
io.on('connection',(socket)=>{// ye connection ek socket de deta haia jisko callback function pass kiya hai
    //console.log(socket.id);
    socket.on('join',(orderId)=>{// yaha pr hum event ko receive kar ke event fire kar rahe h jo app.js file me socket.io me join naam ke event ko emmit kiya tha, 'join' receive hote hi function call ho jayega aur wo data receive ho jayega jo app.js file me socket ke ander 'order._id' ka data hai wo yaha receive ho jayega
        //console.log(orderId);
        socket.join(orderId) // yaha wala jo join h wo socket ka method hai ye event wala join nahi h, ye join method orderId ko join kar rha h aur usko room me join karwa dega

    })
})
 

// ab yaha pr hum wo event listen karenge jo app.js ke file me event ko banaya tha

eventEmitter.on('orderUpdated',(data)=>{// ye 'orderUpdated' event same hona chahiye jisko hume listen karna hai isko app.js me define kiya hai aur 'data' ke ander hume receive ho jayega jisko hume pass kiya h 'id' aur 'status' ki
io.to(`order_${data.id}`).emit('orderUpdated',data)// ya pr 'io.to' se us room ke id ko 'orderupdated' ke naam se event banaya h usko app.js ke ander lsiten kiya hai

})


eventEmitter.on('orderPlaced',(data)=>{// ye hum event ko fire kar rahe jo user order karega uske order ko live receive karne ke liye ye customer side event hume /customer/orderController.js me define kiya hai
    io.to('adminRoom').emit('orderPlaced',data)// aur us customer ke order event ko hum admin ke liye jo 'adminRoom' banaya tha uske uper wo data live receive ho jaaye
})//aur yaha jo 'orderPlaced' ka event jo yaha emit kiya usko js/admin.js ke file me listen karna hai