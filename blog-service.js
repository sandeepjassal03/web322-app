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

const fs = require("fs");

var posts = [], categories = [];

 
function loadPosts() {
  return new Promise(function (resolve, reject){
    fs.readFile("./data/posts.json", "utf-8", (err, data) => {
        if (err) {
          reject("File is not readable");
        }
          posts = JSON.parse(data);
          resolve("Posts loaded")
      });
  });
}

function loadCategories() {
  return new Promise(function(resolve, reject){
    fs.readFile("./data/categories.json",
      "utf-8",
      (err, data) => {
        if (err) {
          reject("File is not readable");
        }
          categories = JSON.parse(data);
          resolve("Categories loaded")
      });
  });
}

exports.getPublishedPosts = function() 
{
  return new Promise(function (resolve, reject){
    var publishedPosts = []

    if(posts.length == 0)
    {
      reject("No results to return")
    }
    
      for(let elem of posts)
      {
        if(elem.published == true)
        {
          publishedPosts.push(elem)
        }
      }  
    resolve(publishedPosts)
  });
}

exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    if (posts.length == 0) {
      reject("No results returned");
    } 
      resolve(posts);
  });
};

exports.getCategories = function() 
{
  return new Promise((resolve, reject) => {
    if(categories.length == 0)
    {
      reject("No results to return")
    }
    else
    {
      resolve(categories)
    }
  });
}

exports.initialize = function () {
  return new Promise((resolve, reject) => {
    loadPosts()
      .then(loadCategories)
      .catch((err) => reject("Load unsuccessful"));
    resolve("Files loaded successfully");
  });
};
