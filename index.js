import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import {readdirSync} from "fs" 

const morgan = require("morgan")
require('dotenv').config()

const app = express();
mongoose.connect(process.env.DATABASE,{
   
}).then(() => console.log("DB CONNECTED"))
.catch((err) => console.log("DB CONNECTION ERROR",err))

// Middleware
app.use(express.json({limit: "5mb"}))
app.use(express.urlencoded({extended: true}))
app.use(cors({

}))

// autoload routes
readdirSync("./routes").map((r) => app.use('/api', require(`./routes/${r}`)))

const port =  process.env.PORT || 8000
app.listen(port,() => console.log(`server Running on port ${port}`))
