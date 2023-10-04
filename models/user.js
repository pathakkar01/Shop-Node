const mongodb = require("mongodb");
const { getDb } = require("../utils/database");

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // {items:[]}
    this._id = id;
  }

  save() {
    const db = getDb();
    console.log("here");
    let dbOp;
    if (this._id) {
      //update the product
      dbOp = db
        .collection("users")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("users").insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log("res", result);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  static findById(userId) {
    const db = getDb();
    console.log("here");
    return db
      .collection("users")
      .find({ _id: new mongodb.ObjectId(userId) })
      .next()
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  addOrder() {
    const db = getDb();
    this.getCart()
      .then((products) => {
        console.log("pro", products);
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.name,
          },
        };

        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
      });
  }
  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray();
  }

  deleteItemFromCart(prodId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productID.toString() !== prodId.toString();
    });
    const db = getDb();
    return db
      .collection("users")
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }
  addToCart(product) {
    const cartProductIdx = this.cart.items.findIndex((cp) => {
      return cp.productID.toString() === product._id.toString();
    });

    const updatedCartItems = [...this.cart.items];
    let newQty = 1;
    if (cartProductIdx >= 0) {
      newQty = this.cart.items[cartProductIdx].qty + 1;
      updatedCartItems[cartProductIdx].qty = newQty;
    } else {
      updatedCartItems.push({
        productID: new mongodb.ObjectId(product._id),
        qty: 1,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    this.cart = updatedCart;
    return db.collection("users").updateOne({ _id: this._id }, { $set: this });
  }
  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((i) => i.productID);
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((p) => {
          return {
            ...p,
            qty: this.cart.items.find((i) => {
              return i.productID.toString() === p._id.toString();
            }).qty,
          };
        });
      });
  }
}

module.exports = User;
