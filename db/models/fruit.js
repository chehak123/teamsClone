var mongoose=require("mongoose");

var fruitSchema=new mongoose.Schema({
    id:{
        type:String
    },
    nameofuser:{
        type:String,
    }
});
module.exports=mongoose.model("fruit",fruitSchema);