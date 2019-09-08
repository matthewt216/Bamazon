var inquirer = require("inquirer");
var mysql = require("mysql");
var password = require("./password");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: password.hostpw,
    database: "bamazon"
});
function prompt(){
    inquirer.prompt([
        {
            type: "input",
            message: "What is the id of the item that you wish to buy?",
            name: "id"
        },
        {
            type: "input",
            message: "How many units?",
            name: "quantity"
        }
    ]).then(function(response){
        con.query("SELECT * FROM products WHERE item_id = " + response.id, function(err, result){
            if (err){
                throw err;
            }
            if (result[0].stock_quantity < response.quantity){
                console.log("Insufficient Quantity!");
                inquirer.prompt([{
                    type: "input",
                    message: "Continue?",
                    name: "continue"
                }]).then(function(response){
                    if (response.continue === "yes"){
                        prompt();
                    }
                    else {
                        process.exit();
                    }
                })
            }
            else {
                var newquantity = result[0].stock_quantity - response.quantity;
                var price = result[0].price * response.quantity;
                console.log("The price is $" + price + ".");
                con.query("UPDATE products SET stock_quantity = " + newquantity + " WHERE item_id = " + response.id, function(err, data){
                    if (err){
                        throw err;
                    }
                    console.log("Table updated.");
                    var productsales = result[0].product_sales + price;
                    con.query("ALTER TABLE products ADD product_sales FLOAT(255, 2);", function(err, data){
                        console.log("Column Added");
                    })
                })
            }
        });
    })
}
con.connect(function(err){
    if (err) throw err;
    con.query("SELECT * FROM products", function(err, result){
        if (err){
            throw err;
        }
        for (i = 0; i < result.length; i++){
            console.log("ID: " + result[i].item_id);
            console.log("Name: " + result[i].product_name);
            console.log("Price: $" + result[i].price);
        }
        prompt();
    })
})