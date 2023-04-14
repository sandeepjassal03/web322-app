/*********************************************************************************
*  WEB322 - Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Sandeep Singh Student ID: 162054217 Date: 8 April 2023
*
*  Cyclic Web App URL: https://clumsy-tam-pike.cyclic.app/
*
*  GitHub Repository URL: https://github.com/sandeepjassal03/web322-app
*
********************************************************************************/
var HTTP_PORT = process.env.PORT || 8080;
const blog = require("./blog-service")
const authData = require("./auth-service")

const express = require("express")
const exphbs = require("express-handlebars")
const stripJs = require("strip-js")
const clientSessions = require("client-sessions")
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');

const app = express()

cloudinary.config({
    cloud_name: 'dz1or2sqs',
    api_key: '795525383273395',
    api_secret: '9CpMRoSjHUY7OG9v3kNWGpunIks',
    secure: true
});

app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

const upload = multer();

function onHttpStart() {
    console.log("The server is listening on: " + HTTP_PORT);
}

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/,
        ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    helpers: {
        navLink: function (url, options) {
            return '<li class="nav-item">' +
                '<a class="nav-link' + ((url == app.locals.activeRoute) ? ' navLink" ' : '"') + '" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        },
        formatDate: function (dateObj) {
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.use(clientSessions({
    cookieName: "session",
    secret: "Assignment_6_Web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}));

app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.get("/", function (req, res) {
    res.redirect('/blog');
})

app.get("/about", function (req, res) {
    res.render("about")
})

app.get("/blog", async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", { data: viewData })

});

app.get("/blog/:id", async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the post by "id"
        viewData.post = await blog.getPostById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    console.log(viewData.message);
    res.render("blog", { data: viewData })
});
app.get("/categories", ensureLogin, function (req, res) {
    blog.getCategories()
        .then((data) => {
            if (data.length > 0) {
                res.render("categories", { categories: data })
            }
            else {
                res.render("categories", { message: "no results" })
            }
        }).catch((err) => {
            res.render("categories", { message: "no results" })
        })
})

app.get("/posts/add", ensureLogin, function (req, res) {
    blog.getCategories()
        .then((data) => res.render("addPost", { categories: data }))
        .catch(() => res.render("addPost", { categories: [] }))
})


app.get("/categories/add", ensureLogin, function (req, res) {
    res.render("addCategory")
})

app.get("/posts/:value", ensureLogin, function (req, res) {
    const value = req.params.value
    blog.getPostById(value)
        .then((data) => {
            res.json(data)
        }).catch((err) => {
            res.send({ err })
        })
})

app.get("/posts", ensureLogin, function (req, res) {
    const category = req.query.category
    const minDateStr = req.query.minDate
    if (category) {
        blog.getPostsByCategory(category)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            }).catch((err) => {
                res.render("posts", { message: "no results" })
            })

    }
    else if (minDateStr) {
        blog.getPostsByMinDate(minDateStr)
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            }).catch((err) => {
                res.render("posts", { message: "no results" })
            })
    }
    else {
        blog.getAllPosts()
            .then((data) => {
                if (data.length > 0) {
                    res.render("posts", { posts: data })
                }
                else {
                    res.render("posts", { message: "no results" })
                }
            }).catch((err) => {
                res.render("posts", { message: "no results" })
            })
    }

})

app.post("/posts/add", upload.single("featureImage"), ensureLogin, function (req, res) {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject({ error });
                        }
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        blog.addPost(req.body)
            .then(() => res.redirect("/posts"))
            .catch((err) => console.log(err))
    }
})

app.post("/categories/add", ensureLogin, function (req, res) {
    blog.addCategory(req.body)
        .then(() => res.redirect("/categories"))
        .catch((err) => console.log(err))
})

app.post("/login", function (req, res) {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory
            }
            res.redirect('/posts');
        })
        .catch((err) => {
            res.render("login", {errorMessage: err, userName: req.body.userName})
        })

})

app.post("/register", function (req, res) {
    authData.registerUser(req.body)
        .then(() => {
            res.render("register", { successMessage: "User created" })
        })
        .catch((err) => {
            res.render("register", { errorMessage: err, userName: req.body.userName })
        })
})

app.get("/posts/delete/:value", ensureLogin, function (req, res) {
    const value = req.params.value
    blog.deletePostById(value)
        .then(() => res.redirect("/posts"))
        .catch(() => res.status(500).send("Unable to Remove Post / Post not found)"))
})

app.get("/categories/delete/:value", ensureLogin, function (req, res) {
    const value = req.params.value
    blog.deleteCategoryById(value)
        .then(() => res.redirect("/categories"))
        .catch(() => res.status(500).send("Unable to Remove Category / Category not found)"))
})

app.get("/login", function (req, res) {
    res.render("login")
})

app.get("/register", function (req, res) {
    res.render("register")
})

app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/")
})

app.get("/userHistory", ensureLogin, function (req, res) {
    res.render("userHistory")
})

app.get("*", function (req, res) {
    res.render("404")
})

blog.initialize()
    .then(authData.initialize)
    .then(() => app.listen(HTTP_PORT, onHttpStart()))
    .catch((err) => console.log("Unable to start server: " + err))