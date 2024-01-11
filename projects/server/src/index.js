const express = require("express");
const path = require("path");
const PORT = 8000;
const cors = require("cors");
const { join } = require("path");
require("dotenv").config({
  path: __dirname + "/../.env",
});


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "backend", "public")));

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const addressRouter = require("./routes/address");
const categoryRouter = require("./routes/category");
const orderRouter = require("./routes/order");
const productRouter = require("./routes/product");
const userRouter = require("./routes/user");
const cartRouter = require("./routes/cart");
const WarehouseRoutes = require("./routes/warehouse");
const mutationRoutes = require("./routes/mutation");
const wishlistRoutes = require("./routes/wishlist");

//Routing
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/address", addressRouter);
app.use("/api/category", categoryRouter);
app.use("/api/order", orderRouter);
app.use("/api/product", productRouter);
app.use("/api/users", userRouter)
app.use("/api/warehouse", WarehouseRoutes);
app.use("/api/mutation", mutationRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRoutes);
app.use("/public", express.static(__dirname + "/public"));



app.get("/api", (req, res) => {
  res.send(`Hello, this is my API`);
});

app.use((req, res) => {
  console.log(`404: ${req.url}`);
  res.status(404).json({
    msg: "NOT FOUND",
  });
});

app.use((err, req, res) => {
  console.log(`500: ${res.url}`);
  console.log(err);
  res.status(500).json({
    msg: "FATAL ERROR",
    err,
  });
});

app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found !");
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes("/api/")) {
    console.error("Error : ", err.stack);
    res.status(500).send("Error !");
  } else {
    next();
  }
});


//region API ROUTES

const clientPath = "../../client/build";
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, clientPath, "index.html"));
});


app.listen(PORT, () => {
  console.log(`APP RUNNING at ${PORT} ✅`);
});
