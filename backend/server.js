const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
const PORT = 5000;
const FRONTEND_DIST = path.join(__dirname, "../Frontend/dist");

// Middleware
app.use(cors());
app.use(express.json());

// Health route
app.get("/test", (req, res) => {
  res.send("Backend working");
});

// API Routes
app.use("/", fileRoutes);

// Serve frontend from the same server (single-port setup)
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// SPA fallback for frontend routes (avoids "Cannot GET /")
app.get("/{*path}", (req, res, next) => {
  const apiPrefix =
    req.path === "/upload" ||
    req.path === "/files" ||
    req.path === "/save" ||
    req.path === "/test" ||
    req.path.startsWith("/file/");

  if (apiPrefix) {
    return next();
  }

  if (fs.existsSync(FRONTEND_DIST)) {
    return res.sendFile(path.join(FRONTEND_DIST, "index.html"));
  }

  return res
    .status(503)
    .send("Frontend build not found. Run: cd Frontend && npm run build");
});

// Return JSON errors so frontend can show meaningful messages
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
