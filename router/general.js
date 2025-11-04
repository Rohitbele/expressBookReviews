// general.js
const express = require("express");
const axios = require("axios");
const books = require("./booksdb");

const public_users = express.Router();

// ---- Task 1: Get all books ----
public_users.get("/", (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// ---- Task 2: Get book by ISBN ----
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) return res.status(200).send(JSON.stringify(book, null, 4));
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
});

// ---- Task 3: Get books by Author ----
public_users.get("/author/:author", (req, res) => {
  const authorParam = req.params.author.toLowerCase();
  const result = [];
  for (let key of Object.keys(books)) {
    const book = books[key];
    if (book.author && book.author.toLowerCase() === authorParam) {
      result.push({ isbn: key, ...book });
    }
  }
  if (result.length > 0) return res.status(200).send(JSON.stringify(result, null, 4));
  return res.status(404).json({ message: `No books found for author '${req.params.author}'.` });
});

// ---- Task 4: Get books by Title ----
public_users.get("/title/:title", (req, res) => {
  const titleParam = req.params.title.toLowerCase();
  const result = [];
  for (let key of Object.keys(books)) {
    const book = books[key];
    if (book.title && book.title.toLowerCase() === titleParam) {
      result.push({ isbn: key, ...book });
    }
  }
  if (result.length > 0) return res.status(200).send(JSON.stringify(result, null, 4));
  return res.status(404).json({ message: `No books found with title '${req.params.title}'.` });
});

// ---- Task 5: Get book reviews ----
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  return res.status(200).send(JSON.stringify(book.reviews || {}, null, 4));
});

// ---------------- PROMISE / ASYNC (Tasks 10–13) ----------------

// Task 10: Get all books using async/await + axios
public_users.get("/axios/books", async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:${process.env.PORT || 3000}/`);
    res.status(200).send(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books via axios", error: err.message });
  }
});

// Task 11: Get book by ISBN using async/await + axios
public_users.get("/axios/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:${process.env.PORT || 3000}/isbn/${isbn}`);
    res.status(200).send(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ISBN via axios", error: err.message });
  }
});

// Task 12: Get books by author using Promises + axios
public_users.get("/axios/author/:author", (req, res) => {
  const author = req.params.author;
  axios
    .get(`http://localhost:${process.env.PORT || 3000}/author/${encodeURIComponent(author)}`)
    .then((response) => res.status(200).send(response.data))
    .catch((err) =>
      res.status(500).json({ message: "Error fetching author via axios", error: err.message })
    );
});

// Task 13: Get books by title using Promises + axios
public_users.get("/axios/title/:title", (req, res) => {
  const title = req.params.title;
  axios
    .get(`http://localhost:${process.env.PORT || 3000}/title/${encodeURIComponent(title)}`)
    .then((response) => res.status(200).send(response.data))
    .catch((err) =>
      res.status(500).json({ message: "Error fetching title via axios", error: err.message })
    );
});

module.exports = public_users;
