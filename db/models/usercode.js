var mongoose=require("mongoose");

var usercodeSchema=new mongoose.Schema({
    id:{
        type:String
    },
    nameofuser:{
        type:String,
    },
    roomid:{
        type:String
    }
});
module.exports=mongoose.model("usercode",usercodeSchema);