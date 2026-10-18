export function authorizeModification(req, res, next) {
  const { user } = req;
  const targetUserId = String(req.params.userId);

  if (user.role === "parent") return next();
  if (user.role === "child" && String(user.id) === targetUserId) return next();

  return res.status(403).json({ error: "Access denied" });
}