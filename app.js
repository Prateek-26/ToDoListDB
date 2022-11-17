const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

// mongodb+srv://<username>:<password>@clusternew.knltqt7.mongodb.net/?retryWrites=true&w=majority

// mongoose.connect("mongodb://localhost:27017/todolistDB")
mongoose.connect("mongodb+srv://admin-prateek:test123@clusternew.knltqt7.mongodb.net/todolistDB")
.then(()=>{
    console.log("Successfully connected to mongodb://localhost:27017/todolistDB");
})
.catch((err)=>{
    console.log("There was a problem in connecting to mongodb://localhost:27017/todolistDB\n\n");
    console.log(err);
});

// mongoose schema
const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name: "Welcome to todoList"});
const item2 = new Item({name: " + to Add"});
const item3 = new Item({name: " <-- to Delete"});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("lists",listSchema);

app.get("/",function(req,res){

    // let day = date.getDate();
    // if(req.body.addButton === "Work List")

    // To read from the todolistDB
    Item.find({},(err,ListItems)=>{
    if(err)
    console.log("Error while reading!");
    else{
        // We have to only print name field of the doc.
        // So either we can use forEach in the list.ejs.
        // Or else we can use .name in the list.ejs

        if(ListItems.length === 0){
        Item.insertMany(defaultItems,(err)=>{
            if(err)
            console.log("Error while writing!");
            else
            console.log("Successfully added Items");
        }); 
        res.redirect("/");
        }
        else{
            res.render("list",{    // we have to mention all the template values
                listTitle: "Today",    // in the  get method itself
                newItemsAdded: ListItems
            });
        }



        // mongoose.connection.close();
    }
});
    
});

app.get("/:customListName",(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);

    // if(List.findOne({name:customListName},(err, foundList)=>{
    //     if(err)
    //     console.log("Error!");
    //     else{
    //     }
    // }))
    // console.log("Already Exists");
    // else{
    //     const list = new List({
    //         name: customListName,
    //         items: defaultItems
    //     });
    //     list.save();
    // }

    // I am using findOne, here foundList will only contain an object/document and not an array, like find() did.
    List.findOne({name:customListName},(err, foundList)=>{
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else{
                // Show an existing list
                res.render("list",{
                    listTitle: foundList.name, // or simply customListName
                    newItemsAdded: foundList.items               
                });
            }
        }
    });


});

app.post("/",function(req,res){
    let itemName = req.body.newItem;

    // star 1
    const listName = req.body.addButton;
    // +
    const itemNew = new Item({
      name: itemName
    });

    if(itemName!=""){
        if(listName === "Today"){   
            itemNew.save();
            res.redirect("/");
        }
        else{
            List.findOne({name:listName},(err, foundList)=>{
                if(err){
                    console.log("Error");
                }
                else{
                    foundList.items.push(itemNew);
                    res.redirect("/"+listName);
                    foundList.save();
                }
            })
        }
    }
    else
    res.redirect("/"+listName);

    // let todoType = req.body.addButton;
    // this will give us the value of the button and will help us to differentiate between work and normal todolist.


    // if(todoType==="Work"){
    //     console.log("Hello");
    //     WorkItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     ListItems.push(item);
    //     res.redirect("/");
    // }

    // here as soon as we come to get it will
                          // will provide us with the list.ejs which
                          // further render the html file 
                          // then firstly it will not have the newItem
                          // then after we post the newItem value will  
                          // get initialised and stored in newListItem
                          // and we will redirect to the home route where
                          // once again list.ejs will render the html
                          // but this time we will be having the value of newListItem
                          /*
                            Now the instead of using a single letiable newListItemitem  we can crete an array out of it so that we can add multiple items one by one!
                          */
});

app.post("/delete",(req,res)=>{

    // star 2
    const checkedItemID = req.body.checkbox;
    const hiddenListName = req.body.hiddenListName;
    console.log(hiddenListName);

    if(hiddenListName === "Today"){
        Item.deleteOne({_id:checkedItemID},(err)=>{
            if(err)
            console.log("Error while deleting the item from the todoList!");
            else
            console.log("Successfully deleted item from the todoList!");
            res.redirect("/");
        });
    } else{
        List.findOneAndUpdate(
            {name:hiddenListName},
            {$pull:{items:{_id:checkedItemID}}},
            (err,foundList)=>{
                if(!err){
                    res.redirect("/"+hiddenListName);
                }
        });
    }
});


// app.get("/work",function(req,res){
//     res.render("list",{
//         listTitle: "Work",
//         newItemsAdded: WorkItems 
//     });
// });

// app.post("/work",function(req,res){
//     res.redirect("/work");
// })

// app.listen(3000,function(){
//     console.log("Server 3000 is up and listening");
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port,function(){
    console.log("Server on " + port +" is up and listening");
});