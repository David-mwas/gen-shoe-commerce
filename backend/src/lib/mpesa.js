// src/lib/mpesa.js
const axios = require("axios");

const MPESA_ENV = process.env.MPESA_ENV || "sandbox";
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_TILL_NUMBER = process.env.MPESA_TILL_NUMBER;
const MPESA_BASE =
  MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken = null; // { token, expiresAt }

async function getAccessToken() {
  if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
    throw new Error("Missing MPESA consumer key/secret in env");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 5000) {
    return cachedToken.token;
  }

  const url = `${MPESA_BASE}/oauth/v1/generate?grant_type=client_credentials`;
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const token = res.data?.access_token;
  const expiresIn = res.data?.expires_in || 3600;
  cachedToken = {
    token,
    expiresAt: now + expiresIn * 1000,
  };

  return token;
}

/**
 * Register C2B validation & confirmation URLs for a ShortCode (Till).
 * Only works in sandbox or when you have appropriate privileges in production.
 */
async function registerC2BUrls({ shortCode, confirmationURL, validationURL }) {
  const token = await getAccessToken();
  const url = `${MPESA_BASE}/mpesa/c2b/v1/registerurl`;

  const payload = {
    ShortCode: shortCode,
    ResponseType: "Completed",
    ConfirmationURL: confirmationURL,
    ValidationURL: validationURL,
  };

  const res = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

module.exports = {
  getAccessToken,
  registerC2BUrls,
  MPESA_TILL_NUMBER,
  MPESA_BASE,
};
