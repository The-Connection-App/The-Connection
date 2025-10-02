import express from "express";
const router = express.Router();
router.get("/api/forums", async (req, res) => {
  try {
    const sample = [
      { id: 1, title: "General Discussion", description: "General community conversation", postsCount: 42 },
      { id: 2, title: "Bible Study", description: "Discuss scripture and study resources", postsCount: 12 }
    ];
    res.json({ forums: sample });
  } catch (err) {
    console.error("Error in /api/forums", err);
    res.status(500).json({ error: "internal_error" });
  }
});
var forums_default = router;
export {
  forums_default as default
};
