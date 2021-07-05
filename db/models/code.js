var mongoose=require("mongoose");

var codeSchema=new mongoose.Schema({
    name:{
        type:String
    },
    host:{
        type:String
    }

});
module.exports=mongoose.model("code",codeSchema);