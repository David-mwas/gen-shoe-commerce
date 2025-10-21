const rateLimit = require("express-rate-limit");

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 6,
  message: { message: "Too many password reset attempts, try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Too many requests, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { forgotLimiter, globalLimiter };
