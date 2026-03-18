function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden: insufficient permissions',
        yourRole: userRole,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}

module.exports = roleMiddleware;