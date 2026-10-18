import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = Router();

router.get("/:userId", authenticate, (req, res) => {
  const watchlist = getWatchlist(Number(req.params.userId));
  if (watchlist === null) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json(watchlist);
});

router.post(
  "/:userId/movies",
  authenticate,
  authorizeModification,
  (req, res) => {
    const movie = addMovie(Number(req.params.userId), req.body);
    if (movie === null) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(201).json(movie);
  }
);

router.put(
  "/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const updated = updateMovie(
      Number(req.params.userId),
      Number(req.params.movieId),
      req.body
    );
    if (updated === null) {
      return res.status(404).json({ error: "User or movie not found." });
    }
    res.json(updated);
  }
);

router.delete(
  "/:userId/movies/:movieId",
  authenticate,
  authorizeModification,
  (req, res) => {
    const result = deleteMovie(
      Number(req.params.userId),
      Number(req.params.movieId)
    );
    if (result === null) {
      return res.status(404).json({ error: "User or movie not found." });
    }
    res.json({ message: "Movie removed successfully." });
  }
);

export default router;