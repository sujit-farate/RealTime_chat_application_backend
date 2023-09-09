const express=require("express");
const app=express()

const Message=require("./models/mongoMessageModel")

var bodyParser = require('body-parser');
const cors=require("cors");
const connectDB = require("./db/connectionDB");
const { router } = require("./routers/router");

const http=require("http").createServer(app)
const io=require("socket.io")(http)

require("dotenv").config();
const port = process.env.PORT || 5000;
const path = require("path");



app.use(cors({ origin: 'http://localhost:3000',}))
// app.use(cors("*"))
// app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1", router);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/fetchData",(req,res)=>{
    user.find().then((result)=>{

        res.send(result)
    })

})


app.post("/message",(req,res)=>{
    let{key,message}=req.body
    const data=new userMessage({
        key:key,
        message:message
    })
    data.save().then(result=>{
        res.send(result)
    }).catch(err=>{
        res.send(err)
    })
})

app.post("/filterMessage",(req,res)=>{
    let{key}=req.body
    userMessage.find({key:key}).then(result=>{
        res.send(result)
    }).catch(err=>{
        res.send(err)
    })
})




 app.post("/get_last_msg", (req, res) => { 
    let { Chat_Id1, Chat_Id2 } = req.body;
     Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
      .then((result) => { res.send(result[result.length-1]); })
     .catch((err) => { res.send(err); }); });


io.on('connection',(socket)=>{
    console.log("socket is connected")



    // socket.on("disconnect",()=>{
    //     console.log("socket is disconnected")
    // })
   
    socket.on("recieveMsg",async(data)=>{
        console.log("datarecieve",data)
    
        // console.log("datarecieve",typeof data)
        try {
            let { Chat_Id1, Chat_Id2 } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
             .then((result) => { 
                 console.log("recievd",result)
                 if(result.length==0){
                    // socket.join(result[0].Chat_Id)
                  socket.emit("getData",result)
                    return
                //     socket.join(result[0].Chat_Id)
                //   io.to(result[0].Chat_Id).emit("getData",result)
                 }
                 socket.join(result[0].Chat_Id)
                  io.to(result[0].Chat_Id).emit("getData",result)
                //  socket.join(result[0].Chat_Id)
                //  socket.emit("getData",result)
                // socket.emit("getData",result)
                // res.send(result); 
                
            })
        } catch (error) {
            console.log("error",err)
        }
       
        // .catch((err) => { 
        //     console.log("error",err)
        //     // res.send(err);
        //  });
    })




socket.on("storeData",async(data)=>{
// console.log("data",typeof data)

    let { from, to,message, Chat_Id } = JSON.parse(data);
    // socket.join(Chat_Id)
    //    if (!message || !from || !to) { 
    //        // res.send({ message: "Please provide all the required fields" });
    //        return 
    //  } 
     const chat_id = await Message.findOne({ $or: [{ Chat_Id: `${from}${to}` }, { Chat_Id: `${to}${from}` }], });  
        console.log(chat_id);
         if (chat_id == null) { 
            Chat_Id = `${from}_${to}`; 
        } else {
             Chat_Id = chat_id.Chat_Id; 
            }
             const msg = new Message({ message: message, from: from, to: to, Chat_Id: Chat_Id, });
          msg.save() .then((result) => { 
            console.log("message sent succefully",result)

            // let { Chat_Id1, Chat_Id2 } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: `${from}_${to}` }, { Chat_Id: `${to}_${from}` }] })
             .then((result) => { 
                 console.log("recievd",result[0].Chat_Id)
                 socket.join(result[0].Chat_Id)
                 io.to(result[0].Chat_Id).emit("getData",result)
                //  socket.emit("getData",result)

                // socket.emit("getData",result)
                // res.send(result); 
                
            })
            .catch((err) => { 
                console.log("error",err)
                // res.send(err);
             });

            // res.send(result);
         }) 
         .catch((err) => { 
            console.log("error",err)
            // res.send({ message: "internal server error" }); 
        }); 
        


console.log(data)




})

socket.on("isTyping",(data)=>{
console.log(data);
     
        try {
            let { Chat_Id1, Chat_Id2 ,isTyping } = JSON.parse(data);
            Message.find({ $or: [{ Chat_Id: Chat_Id1 }, { Chat_Id: Chat_Id2 }] })
             .then((result) => { 
                 console.log("recievd",result)
                 if(result.length==0){
                   
                 
                    return
              
                 }
                 socket.join(result[0].Chat_Id)
                 console.log(`user joined room ${result[0].Chat_Id}`)
                 socket.broadcast.to(result[0].Chat_Id).emit("checkTyping",{chatId:result[0].Chat_Id,isTyping:isTyping})
              
                
            })
        } catch (error) {
            console.log("error",err)
        }




          
              
        
})

})


const Start = async () => {
    try {
      await connectDB();
      http.listen(port, () => {
        console.log(`listening port ${port}`);
      });
    } catch (error) {
      console.log("error", error);
    }
  };
  
  Start();


// http.listen(4000,()=>{
//     console.log("listening port 4000")
// })

// app.listen(4000,()=>{
//     console.log("listening port 4000")
// })
