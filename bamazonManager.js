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
            type: "list",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
            name: "managerview"
        }
    ]).then(function(response){
        if (response.managerview === "View Products for Sale"){
            con.query("SELECT * FROM products", function(err, data){
                for (i = 0; i < data.length; i++){
                    console.log("ID: " + data[i].item_id);
                    console.log("Name: " + data[i].product_name);
                    console.log("Price: $" + data[i].price);
                    console.log("Quantity: " + data[i].stock_quantity);
                    console.log("----------------------------------------");
                }
                prompt();
            })
        }
        else if (response.managerview === "View Low Inventory"){
            con.query("SELECT * FROM products", function(err, data){
                for (i = 0; i < data.length; i++){
                    if (data[i].stock_quantity < 5){
                        console.log("ID: " + data[i].item_id);
                        console.log("Name: " + data[i].product_name);
                        console.log("Price: $" + data[i].price);
                        console.log("Quantity: " + data[i].stock_quantity);
                        console.log("----------------------------------------");
                    }
                }
                prompt();
            })
        }
        else if (response.managerview === "Add to Inventory"){
            inquirer.prompt([
                {
                    type: "input",
                    message: "Item ID?",
                    name: "ID"
                },
                {
                    type: "input",
                    message: "How many?",
                    name: "quantity"
                }
            ]).then(function(response){
                var index;
                con.query("SELECT * FROM products", function(err, data){
                    for (i = 0; i < data.length; i++){
                        if (parseInt(response.ID) === parseInt(data[i].item_id)){
                            index = i;
                            break;
                        }
                    }
                    var newquantity = parseInt(response.quantity) + data[i].stock_quantity;
                    con.query("UPDATE products SET stock_quantity = " + newquantity + " WHERE item_id = " + response.ID, function(err, data){
                        console.log("Inventory added.");
                        prompt();
                    })
                })
            })
        }
        else if (response.managerview === "Add New Product"){
            inquirer.prompt([
                {
                    type: "input",
                    message: "ITEM ID: ",
                    name: "ID"
                },
                {
                    type: "input",
                    message: "Product Name: ",
                    name: "name"
                },
                {
                    type: "input",
                    message: "Department: ",
                    name: "department"
                },
                {
                    type: "input",
                    message: "Price: ",
                    name: "price"
                },
                {
                    type: "input",
                    message: "Quantity: ",
                    name: "quantity"
                }
            ]).then(function(response){
                con.query("INSERT INTO products(item_id, product_name, department_name, price, stock_quantity) VALUES (" + response.ID + ", '" + response.name + "','" + response.department + "', " + response.price + ", " + response.quantity + ");", function(err, data){
                    if (err){
                        throw err;
                    }
                    console.log("Product added.");
                    prompt();
                })  
            })
        }
        else if (response.managerview === "Quit"){
            process.exit();
        }
    })
}
prompt();