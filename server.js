var HTTP_PORT = process.env.PORT || 8080;

var blog = require("./blog-service")
var express = require("express")
var app = express()
var path = require("path");

function onHttpStart()
{
    console.log("The server is listening on: " + HTTP_PORT);
}

app.use(express.static('public'))

app.get("/", function(req,res){
    res.redirect('/about');
})

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"))
})

app.get("/blog", function(req,res){
    blog.getPublishedPosts()
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.send(err)
    })
})

app.get("/categories", function(req,res){
    blog.getCategories()
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.send(err)
    })
})

app.get("/posts", function(req,res){
    blog.getAllPosts()
    .then((data) => {
        res.json({data})
    }).catch((err) => {
        res.send(err)
    })
})

blog.initialize()
.then(app.listen(HTTP_PORT, onHttpStart()))
.catch((err) => console.log(err));