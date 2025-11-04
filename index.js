// index.js
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const generalRouter = require("./general");
const authUsersRouter = require("./auth_users");

const app = express();
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: "sessionSecretKey123",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Authentication middleware for /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
  if (!req.session || !req.session.authorization) {
    return res.status(403).json({ message: "User not logged in or session expired" });
  }

  const accessToken = req.session.authorization.accessToken;
  if (!accessToken) {
    return res.status(403).json({ message: "No access token found in session" });
  }

  jwt.verify(accessToken, "access", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired access token" });
    }
    req.user = { username: decoded.username };
    next();
  });
});

// Mount routers
app.use("/", generalRouter);
app.use("/customer/auth", authUsersRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Book Review app listening on port ${PORT}`);
});
