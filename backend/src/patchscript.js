// scripts/backfill-public-ids.js (run once in node)
const mongoose = require("mongoose");
const productModel = require("./models/product.model");
// const Product = require("../models/product.model.js");

function extractPublicIdFromUrl(url) {
  if (!url) return null;
  const idx = url.indexOf("/upload/");
  if (idx === -1) return null;
  let after = url.slice(idx + "/upload/".length).split("?")[0];
  const vMatch = after.match(/^v\d+\//);
  if (vMatch) after = after.slice(vMatch[0].length);
  const firstSeg = after.split("/")[0];
  if (/[,_=]/.test(firstSeg)) after = after.split("/").slice(1).join("/");
  const lastDot = after.lastIndexOf(".");
  if (lastDot !== -1) after = after.slice(0, lastDot);
  return after;
}
const MONGO_URI = "mongodb://localhost:27017/shoedb";

(async function () {
  await mongoose.connect(MONGO_URI);
  const products = await productModel
    .find({
      image_url: { $exists: true, $ne: "" },
      image_public_id: { $in: [null, undefined, ""] },
    })
    .limit(5000)
    .exec();
  let updated = 0;
  for (const p of products) {
    const pid = extractPublicIdFromUrl(p.image_url);
    if (pid) {
      p.image_public_id = pid;
      await p.save();
      updated++;
    }
  }
  console.log("done, updated", updated);
  process.exit(0);
})();
