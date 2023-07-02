const mongoose=require("mongoose");
const userschema=new mongoose.Schema({
  from:{
type:String,required:true
  },
  to:{
    type:String,required:true
      },
      Chat_Id:{type:String,required: true,},
    message: {
        type: String,
        required: true,
       
      },
      datetime: {
        type: Date,
        default: Date.now
      }
    
})

module.exports=mongoose.model("getMessage",userschema)