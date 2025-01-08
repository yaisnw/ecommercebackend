const express = require("express");
const accountsQuery = require("./accountsQuery");
const accountsRouter = express.Router();
const bcrypt = require("bcryptjs");

accountsRouter.post("/signup", async (req, res, next) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ msg: 'Username and password are required.' });
  }
  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(password, salt);

  const takenUsername = await accountsQuery.getOneByUsername(username)

  if (takenUsername) {
    res.status(409).json({ msg: "this username is taken" })
  }
  else {
    const newUser = await accountsQuery.createUser(username, hashedPassword);
    if (newUser) {
      res.status(201).json({
        msg: "user created",
        newUser,
      });
    } else {
      res.status(500).json({
        msg: "user wasn't created",
      });
    }
  }
});

accountsRouter.get("/", async (req, res, next) => {
  try {
    const result = await accountsQuery.getAll();
    res.json(result);
  } catch (error) {
    console.error("Error retrieving accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
accountsRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await accountsQuery.getOneById(req.params.id);
    res.json(result);
  } catch (e) {
    console.error("error detected");
    res.status(500);
  }
});
accountsRouter.put("/:id", async (req, res, next) => {
  const { username, password } = req.body;
  const { id } = req.params;
  try {
    const result = await accountsQuery.changeInfo(id, username, password);
    res.json(result);
  } catch (e) {
    console.error("error detected");
    res.status(500).json({ error: "request failed" });
  }
});

module.exports = accountsRouter;
