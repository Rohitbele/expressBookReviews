// auth_users.js
const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb");

const regd_users = express.Router();
const users = []; // in-memory store for registered users

const doesUserExist = (username) => users.some((u) => u.username === username);
const isValidUser = (username, password) =>
  users.some((u) => u.username === username && u.password === password);

// ---- Task 6: Register ----
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required." });

  if (doesUserExist(username))
    return res.status(409).json({ message: "Username already exists." });

  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully." });
});

// ---- Task 7: Login ----
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!isValidUser(username, password))
    return res.status(401).json({ message: "Invalid username or password." });

  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };
  res.status(200).json({ message: "User successfully logged in.", accessToken });
});

// ---- Task 8: Add or Modify Review ----
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `Book ${isbn} not found.` });

  const username =
    req.session?.authorization?.username || req.user?.username;
  if (!username)
    return res.status(403).json({ message: "User not authorized or session not found." });

  const reviewText = req.query.review || req.body.review;
  if (!reviewText)
    return res.status(400).json({ message: "Please provide a review text." });

  if (!book.reviews) book.reviews = {};
  const action = book.reviews[username] ? "modified" : "added";
  book.reviews[username] = reviewText;

  res.status(200).json({ message: `Review ${action} successfully.`, reviews: book.reviews });
});

// ---- Task 9: Delete Review ----
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `Book ${isbn} not found.` });

  const username =
    req.session?.authorization?.username || req.user?.username;
  if (!username)
    return res.status(403).json({ message: "User not authorized or session not found." });

  if (!book.reviews?.[username])
    return res.status(404).json({ message: "No review by this user found." });

  delete book.reviews[username];
  res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});

module.exports = regd_users;
