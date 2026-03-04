
//pass = tirTlOeVnj45eucd

const express  = require ("express");
const mongoose = require ("mongoose");
const router = require("./Routes/RegisterRoutes");

const app = express();
const cors = require("cors");


app.use(express.json());
//middelware
app.use(cors());
app.use("/users",router);

mongoose.connect("mongodb+srv://admin:tirTlOeVnj45eucd@cluster0.c2joljo.mongodb.net/")
.then(()=> console.log("connected to mongo DB "))
.then(()=> {
    app.listen(5000);
})
.catch((err) => console.log((err)));