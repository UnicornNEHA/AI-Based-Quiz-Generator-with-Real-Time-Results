const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // we will create this next

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected test route
router.get("/protected", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, this is a protected route!` });
});

module.exports = router;
