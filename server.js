/*********************************************************************************
*  WEB322 - Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sandeep Singh Student ID: 162054217 Date: 16 February 2023
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
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');

cloudinary.config({
    cloud_name: 'dz1or2sqs',
    api_key: '795525383273395',
    api_secret: '9CpMRoSjHUY7OG9v3kNWGpunIks',
    secure: true
});

const upload = multer(); 

function onHttpStart()
{
    console.log("The server is listening on: " + HTTP_PORT);
}

app.use(express.urlencoded({ extended : true }));
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
        res.send({err})
    })
})

app.get("/categories", function(req,res){
    blog.getCategories()
    .then((data) => {
        res.json(data)
    }).catch((err) => {
        res.send({err})
    })
})

app.get("/posts/add", function(req,res){    
    res.sendFile(path.join(__dirname,"/views/addPost.html"))
})

app.get("/posts/:value", function (req,res) {
    const value = req.params.value
    blog.getPostById(value)
        .then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({err})
        })
})
app.get("/posts", function(req,res){
    const category = req.query.category
    const minDateStr = req.query.minDate
    if(category)
    {
        blog.getPostsByCategory(category)
        .then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({err})
        })

    }
    else if(minDateStr)
    {
        blog.getPostsByMinDate(minDateStr)
        .then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({err})
        })
    }
    else
    {
        blog.getAllPosts()
        .then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({err})
        })
    }
    
})



app.post("/posts/add", upload.single("featureImage"), function(req,res){
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject({error});
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
        blog.addPost(req.body)
        .then(res.redirect("/posts"))
        .catch((err)=>console.log(err))        
    } 
    
})

app.get("*", function(req,res){
   res.sendFile(path.join(__dirname,"/views/404.html"));
})


blog.initialize()
.then(app.listen(HTTP_PORT, onHttpStart()))
.catch((err) => console.log(err));