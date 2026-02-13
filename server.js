const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// static images folder
app.use("/images", express.static("images"));

/* ===== MongoDB connect ===== */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Mongo Error:", err));

/* ===== USER SCHEMA ===== */
const userSchema = new mongoose.Schema({
  mobile: String,
  password: String,
  role: { type: String, default: "user" }
});
const User = mongoose.model("User", userSchema);

/* ===== SIGNUP ===== */
app.post("/api/signup", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password)
      return res.status(400).json({ error: "Missing fields" });

    // admin number auto admin
    const role = mobile === "9999999999" ? "admin" : "user";

    const newUser = new User({ mobile, password, role });
    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== LOGIN ===== */
app.post("/api/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile, password });
    if (!user) return res.status(401).json({ error: "Invalid login" });

    res.json({
      name: user.mobile,
      role: user.role
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== PRODUCT SCHEMA ===== */
const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  image: String
});
const Product = mongoose.model("Product", productSchema);

/* ===== ADD PRODUCT ===== */
app.post("/api/add-product", async (req, res) => {
  try {
    const { title, price, image } = req.body;

    if (!title || !price || !image)
      return res.status(400).json({ error: "Missing fields" });

    const newProduct = new Product({ title, price, image });
    await newProduct.save();

    res.json({ message: "Product added successfully" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== GET PRODUCTS ===== */
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== ORDER SCHEMA ===== */
const orderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  city: String,
  payment: String,

  items: [
    {
      title: String,
      price: String,
      image: String,
      qty: Number
    }
  ],

  total: Number,
  status: { type: String, default: "Pending" }
});

const Order = mongoose.model("Order", orderSchema);

/* ===== ADD ORDER ===== */

app.post("/api/add-order", async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== GET ORDERS ===== */
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

/* ===== START SERVER ===== */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});