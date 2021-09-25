const Menu = require('../../models/menu');

function homeController(){
    return{
       async index(req,res){

            const pizzas = await Menu.find();
            // console.log(pizzas);
            res.render('home',{pizzas: pizzas}); // ye pizzas key home ejs me automatic chala jayega sara data waha chala jayega

            // Menu.find().then((pizzas)=>{
            //     console.log(pizzas);
            //     res.render('home',{pizzas: pizzas});
            // })
            
        }
    }
}


module.exports = homeController;