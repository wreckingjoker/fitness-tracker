// Auth disabled — single-user personal app, user id is always 1
function withAuth(handler) {
  return async (req, res) => {
    req.user = { id: 1 };
    return handler(req, res);
  };
}

module.exports = { withAuth };
