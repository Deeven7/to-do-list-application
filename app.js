const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// var newitems = ["Buy food", "Cook food", "Eat food"];
// var workItems = []

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Deeven:Test123@cluster0-rpbk3.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"welcome to your todolist"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];



const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);




app.get("/", function(req, res){

Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
       console.log("Successfully saved the default items to the DB.");
      }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Journal", Additems:foundItems });
  }

});
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }

    else{
           res.render("list", {listTitle: foundList.name, Additems:foundList.items});
    }
  }
  });



});





app.post("/",function(req, res){
  const itemName = req.body.ni;
  const listName = req.body.list;


  const item = new Item({
    name:itemName
  });


if(listName === "Journal"){
  item.save();
res.redirect("/");
}else{
   List.findOne({name: listName}, function(err, foundList){
     foundList.items.push(item);
     foundList.save();
     res.redirect("/" + listName);
   });
}

});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Journal"){
    Item.findByIdAndDelete(checkedItemId,function(err){
      if(err){
        console.log("There is an error");
      }else{
        console.log("You have Successfully removed the item");
        res.redirect("/");
      }
    });
  }else{
     List.findOneAndUpdate({name:listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});




app.post("/work",function(req, res){
   var item = req.body.newitem;
   workItems.push(newitem);
   res.redirect("/work");
});



app.get("/about",function(req, res){
  res.render("about");
});



app.listen(process.env.PORT || 3000, function(){
  console.log("The server has started Successfully");
});
