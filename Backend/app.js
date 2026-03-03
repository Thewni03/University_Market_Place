
//pass = tirTlOeVnj45eucd

const express  = require ("express");
const mongoose = require ("mongoose");

const app = express();

//middelware
app.use("/",(req,res,next) => {

    res.send("it is working");
})

mongoose.connect("mongodb+srv://admin:tirTlOeVnj45eucd@cluster0.c2joljo.mongodb.net/")
.then(()=> console.log("connected to mongo DB "))
.then(()=> {
    app.listen(5000);
})
.catch((err) => console.log((err)));