const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;


var sequelize = new Sequelize(
  "nkeanlbq",
  "nkeanlbq",
  "JCZPmlJqyxY92Tg0VUE3vu7locIF7M5x",
  {
    host: "suleiman.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Post = sequelize.define(
  "Post",
  {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
  }
);

var Category = sequelize.define(
  "Category",
  {
    category: Sequelize.STRING
  }
);

Post.belongsTo(Category, { foreignKey: 'category' });

exports.getPublishedPostsByCategory = function (value) {
  return new Promise(function (resolve, reject) {
    Post.findAll({
      where: { published: true, category: value }
    })
      .then((data) => resolve(data))
      .catch((err) => reject(err))
  });
}
exports.getPublishedPosts = function () {
  return new Promise(function (resolve, reject) {
    Post.findAll({
      where: { published: true }
    })
      .then((data) => resolve(data))
      .catch(() => reject("No results returned"))
  });
}

exports.getAllPosts = function () {
  return new Promise((resolve, reject) => {
    Post.findAll()
      .then((data) => resolve(data))
      .catch(() => reject("No results returned"))
  });
};

exports.getPostById = function (value) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { id: value }
    })
      .then((data) => resolve(data[0]))
      .catch((err) => reject(err))
  });
};

exports.getPostsByCategory = function (id) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: { category: id }
    })
      .then((data) => resolve(data))
      .catch(() => reject("No results returned"))
  });
};

exports.getPostsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Post.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr)
        }
      }
    })
      .then((data) => resolve(data))
      .catch(() => reject("No results returned"))
  });
};

exports.addPost = function (postData) {
  return new Promise((resolve, reject) => {
    postData.published = (postData.published) ? true : false;
    for (data in postData) {
      if (data == "") {
        data = null
      }
    }
    postData.postDate = new Date()
    Post.create({
      body: postData.body,
      title: postData.title,
      postDate: postData.postDate,
      category: postData.category,
      featureImage: postData.featureImage,
      published: postData.published
    })
      .then((post) => resolve(post))
      .catch(() => reject("Unable to create Post"))
  });
};

exports.deletePostById = function (value) {
  return new Promise((resolve, reject) => {
    Post.destroy({
      where: { id: value }
    })
      .then((post) => resolve(value + " deleted"))
      .catch(() => reject("Unable to delete category"))
  });
};

exports.getCategories = function () {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then((data) => resolve(data))
      .catch(() => reject("No results returned"))
  });
}

exports.addCategory = function (categoryData) {
  return new Promise((resolve, reject) => {
    for (data in categoryData) {
      if (data == "") {
        data = null
      }
    }
    Category.create({
      category: categoryData.category
    })
      .then((category) => resolve(category))
      .catch((err) => reject(err))
  });
};

exports.deleteCategoryById = function (value) {
  return new Promise((resolve, reject) => {
    Category.destroy({
      where: { id: value }
    })
      .then((category) => resolve(category))
      .catch(() => reject("Unable to delete category"))
  });
};

exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then((msg) => resolve(msg))
      .catch(() => reject("unable to sync the database"))
  });
};