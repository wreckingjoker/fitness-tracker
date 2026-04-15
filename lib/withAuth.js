const jwt = require("jsonwebtoken");

function withAuth(handler) {
  return async (req, res) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { withAuth };
