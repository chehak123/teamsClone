var mongoose=require("mongoose");

var codeSchema=new mongoose.Schema({
    name:{
        type:String,
        host: String
    }
});
module.exports=mongoose.model("code",codeSchema);