const fs = require("fs");

var posts = [], categories = [];

// 
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
      reject("No results to return2")
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
      reject("No results returned1");
    } 
      resolve(posts);
  });
};
exports.initialize = function () {
  return new Promise((resolve, reject) => {
    loadPosts()
      .then(loadCategories)
      .catch((err) => reject("Load unsuccessful"));
    resolve("Files loaded successfully");
  });
};



exports.getCategories = function() 
{
  return new Promise((resolve, reject) => {
    if(categories.length == 0)
    {
      reject("No results to return3")
    }
    else
    {
      resolve(categories)
    }
  });
}

