import express from "express";
import jwt from "jsonwebtoken";
import { authenticate } from "./middleware/authenticate.js";
import { authorizeModification } from "./middleware/authorize.js";
// Assuming you have these utility functions in ./utils/db.js
import { findUserByUsername, getWatchlist, addMovie, updateMovie, deleteMovie } from "./utils/db.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(express.json());

// --- Auth Route ---
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  // 1. Missing fields
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // 2. User not found
  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // 3. Wrong password (in a real app, use bcrypt.compare)
  if (user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // 4. Success - generate token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// --- Watchlist Routes (All protected by authenticate) ---

// GET: Any authenticated user can view any user's watchlist
app.get("/api/watchlist/:userId", authenticate, async (req, res) => {
  const watchlist = await getWatchlist(req.params.userId);
  res.json(watchlist);
});

// POST: Add a movie (Protected by both authenticate & authorizeModification)
app.post(
  "/api/watchlist/:userId/movies",
  authenticate,
  authorizeModification,
  async (req, res) => {
    const movie = req.body;
    const newMovie = await addMovie(req.params.userId, movie);
    res.status(201).json(newMovie);
  }
);

// PUT: Update a movie (Protected by both)
app.put(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  async (req, res) => {
    const updatedMovie = await updateMovie(
      req.params.userId,
      req.params.movieId,
      req.body
    );
    res.json(updatedMovie);
  }
);

// DELETE: Remove a movie (Protected by both)
app.delete(
  "/api/watchlist/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  async (req, res) => {
    await deleteMovie(req.params.userId, req.params.movieId);
    res.json({ message: "Movie removed successfully." });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});