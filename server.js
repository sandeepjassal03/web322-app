/*********************************************************************************
*  WEB322 - Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sandeep Singh Student ID: 162054217 Date: 1 February 2023
*
*  Cyclic Web App URL: https://clumsy-tam-pike.cyclic.app/
*
*  GitHub Repository URL: https://github.com/sandeepjassal03/web322-app
*
********************************************************************************/
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