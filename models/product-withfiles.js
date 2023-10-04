const fs = require("fs");
const path = require("path");
const Cart = require("./cart");

const p = path.join(
  path.dirname(require.main.filename),
  "data",
  "products.json"
);
const getProductsFromFile = (cb) => {
  fs.readFile(p, (error, fileContent) => {
    if (error) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      console.log("this.id", this.id);
      if (this.id) {
        const existingProductIdx = products.findIndex(
          (prod) => prod.id === this.id
        );
        console.log("existingProductIdx", existingProductIdx);
        const updatedProducts = [...products];
        updatedProducts[existingProductIdx] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err);
        });
      } else {
        console.log("existingProductIdx", this.id);
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(prodId) {
    console.log(prodId);
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === prodId);
      const upadtedProducts = products.filter((p) => p.id !== prodId);
      console.log("upadtedProducts", upadtedProducts);
      fs.writeFile(p, JSON.stringify(upadtedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(prodId, product.price);
        }
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
};
