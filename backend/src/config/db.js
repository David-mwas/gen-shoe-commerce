const mongoose = require("mongoose");

// handle crashes
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});
mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected");
  process.exit(1);
});

async function connectDB(mongoURI) {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
}

module.exports = connectDB;
