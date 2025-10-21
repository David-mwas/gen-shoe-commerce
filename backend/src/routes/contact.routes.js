const express = require("express");
const { body, validationResult } = require("express-validator");
const { sendMail, compileContactHtml } = require("../lib/mailer");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, email, message } = req.body;
    const html = compileContactHtml({ name, email, message });
    const to = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

    try {
      await sendMail({
        to,
        subject: `Contact form: ${name} <${email}>`,
        text: `${name} (${email}) says: ${message}`,
        html,
      });
      return res.json({ message: "Message sent. We'll get back to you soon." });
    } catch (err) {
      console.error("contact send error:", err);
      return res.status(500).json({ message: "Failed to send message" });
    }
  }
);

module.exports = router;
