import express from "express";

const router = express.Router();

router.post("/sign-up", async (req, res) => {
  res.send("sign-up");
});

router.post("/sign-in", async (req, res) => {
  res.send("sign-in");
});

export default router;