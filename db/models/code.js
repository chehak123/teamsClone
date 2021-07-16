//roomcode schema withits roomcode, hostname, messages in that room and the name set by user
var mongoose=require("mongoose");

var codeSchema=new mongoose.Schema({
    name:{
        type:String
    },
    host:{
        type:String
    },
    messages:[{
       username:{type: String},
       chat:{type:String},
       avatar:{type:String}
    }],
    setname:{
        type:String
    }

});
module.exports=mongoose.model("code",codeSchema);