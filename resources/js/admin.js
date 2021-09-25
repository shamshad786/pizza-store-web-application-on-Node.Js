const axios = require('axios')
const moment = require('moment');
const Noty = require('noty');


function initAdmin(socket){
    const orderTableBody = document.querySelector('#orderTableBody');// ye admin ke order.ejs ko use kiya h
    let orders = []
    let markup


    axios.get('/admin/orders',{// aur ye sab axios ka get() saare orders ke data ko get kar ke admin ke orders page pr bhej dega 
        headers:{
            "X-Requested-with": "XMLHttpRequest"// ye http ki header request h jissey request karne ke baad header http ka get response dega
        }
    }).then(res =>{ // yaha pr then ke ander orders ka data aa gya hai 
        orders = res.data// jisko yaha pr orders[] ke array me save kr diya hai 
        markup = generateMarkup(orders)// ye markup ka use kar ke html table banaya h jisme jisme dynamically order ke data fetch honge
        orderTableBody.innerHTML = markup// inner html ki help se yaha pr hum markup ke ander table banayenge
    }).catch(err =>{
        console.log(err);
    })

    function renderItems (items){
        let parsedItems = Object.values(items)
        return parsedItems.map((menuItem)=>{// ye databse ke ander ke pizza order ke ander jo bhi items(pizza) ki name aur quantity h hum usko yaha get kar rahe hai
            return `
            <p>${menuItem.item.name} - ${menuItem.qty} pcs </p>
            `
        }).join('')// ye join ka matlab h in saare aaray data ko ek hi line me string join kar dega 
    }

    function generateMarkup(orders){//yaha pr function ka use use kar ke html table ka markup bana ke 'markup' variable bhej rahe hai 
        return orders.map(order => {
            return `
                <tr>
                <td class="border px-4 py-2 text-green-900">
                    <p>${ order._id }</p>
                    <div>${ renderItems(order.items) }</div>
                </td>
                <td class="border px-4 py-2">${ order.customerId.name }</td>
                <td class="border px-4 py-2">${ order.address }</td>
                <td class="border px-4 py-2">${ order.phone }</td>
                <td class="border px-4 py-2">
                    <div class="inline-block relative w-64">
                        <form action="/admin/order/status" method="POST">
                            <input type="hidden" name="orderId" value="${ order._id }">
                            <select name="status" onchange="this.form.submit()"
                                class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
                                <option value="order_placed"
                                    ${ order.status === 'order_placed' ? 'selected' : '' }>
                                    Placed</option>
                                <option value="confirmed" ${ order.status === 'confirmed' ? 'selected' : '' }>
                                    Confirmed</option>
                                <option value="prepared" ${ order.status === 'prepared' ? 'selected' : '' }>
                                    Prepared</option>
                                <option value="delivered" ${ order.status === 'delivered' ? 'selected' : '' }>
                                    Delivered
                                </option>
                                <option value="completed" ${ order.status === 'completed' ? 'selected' : '' }>
                                    Completed
                                </option>
                            </select>
                        </form>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20">
                                <path
                                    d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </td>
                <td class="border px-4 py-2">
                    ${ moment(order.createdAt).format('hh:mm A') }
                </td>
                <td class="border px-4 py-2">
                   ${order.paymentStatus ? 'Paid By Card' : 'COD'}
                </td>
            </tr>
        `
        }).join('')// ye join ka matlab h in saare aaray data ko ek hi line me string join kar dega 

    }
    
    socket.on('orderPlaced',(order)=>{// is event 'orderPlaced' ko jo yaha listen kar rahe h isko server.js me define kiya hai ye customer ke ordder karne ke baad data ko live admin ke dashboard pr bhejne ke liye hai
        new Noty({// aur ye logic admin ke order receive karne ke baad notification dega
            type: 'success',
            timeout: '1000',
            text: 'New Order Received !',
            //progressBar: true
        }).show();
        orders.unshift(order)// yaha pr new order jo receive ho rha h usko add kar rahe hai hum yaha 'push()' bhi add kar sakte the but jo orders h wo array me aur array me push() order ko last me add kar deta hai isliye 'unshift()' ka use kiya h taki order uper hi add ho
        orderTableBody.innerHTML = '' //ye table ka jo body hai admin dashboard pr usko clear karne ke liye hai 
        orderTableBody.innerHTML = generateMarkup(orders) // aur ye table markup ko dubara add karne ke liye hai aur 'orders' ko pass kiya hai taki jo bhi naya order add kiya h wo markup me add ho jaaye
    })

           
}

 
module.exports = initAdmin;