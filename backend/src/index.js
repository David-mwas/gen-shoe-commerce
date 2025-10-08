require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const authRoutes = require("./routes/auth.routes.js");
const productsRoutes = require("./routes/product.routes.js");
const cartRoutes = require("./routes/cart.routes.js");

const ordersRoutes = require("./routes/order.routes.js");
// const paymentsRoutes = require("./routes/payment");
const brandsRoutes = require("./routes/brand.routes.js");
const categoriesRoutes = require("./routes/category.routes.js");
const paymentsRoutes = require("./routes/payment.routes.js");
const uploadsRoutes = require("./routes/uploads.routes.js");

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGO_URI);

  const app = express();
  app.use(
    cors({
      origin: ["https://shoestore-rust.vercel.app", "http://localhost:5173"],
    })
  );
  app.use(
    cors({
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // morgan logger
  app.use(require("morgan")("dev"));

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/cart", cartRoutes);

  app.use("/api/uploads", uploadsRoutes);

  app.use("/api/orders", ordersRoutes);
  // app.use("/api/payments", paymentsRoutes);
  app.use("/api/brands", brandsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/payments", paymentsRoutes);

  app.get("/", (req, res) => res.send("Shoe API up"));

  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
