
//pass = hLqCW3XFmnFTbzj8

const express  = require ("express");
const mongoose = require ("mongoose");
const router = require("./Routes/RegisterRoutes");

const app = express();
const cors = require("cors");


app.use(express.json());
//middelware
app.use(cors());
app.use("/users",router);
app.use("/uploads", express.static("uploads"));
mongoose.connect("mongodb+srv://admin:hLqCW3XFmnFTbzj8@cluster0.c2joljo.mongodb.net/?appName=Cluster0")
.then(()=> console.log("connected to mongo DB "))
.then(()=> {
    app.listen(5000);
})
.catch((err) => console.log((err)));