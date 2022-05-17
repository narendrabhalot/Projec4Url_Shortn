const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const port = 3000
const route = require('./routes/route');



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect("mongodb+srv://rohit2424:AdMyJHKIfWtpT31H@cluster0.ki3d0.mongodb.net/group63Database",
{
    useNewUrlParser: true
})

    .then(() => console.log("MongoDB is Connected."))
    .catch((err) => console.log(err.message))

app.use('/', route);


app.listen(process.env.PORT || port, function () {
    console.log("Express app is running on ", process.env.PORT || port)
})