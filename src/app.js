const express = require('express');

const app = express();

app.use("/test",(req,res)=>{
    res.send("Hello from the server");
})

app.listen(3001,()=>{
    console.log("Server started successfully");
}); 

