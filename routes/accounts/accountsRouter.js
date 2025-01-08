const express = require("express");
const accountsQuery = require("./accountsQuery");
const accountsRouter = express.Router();
const bcrypt = require("bcryptjs");

accountsRouter.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required." });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const takenUsername = await accountsQuery.getOneByUsername(username);

    if (takenUsername) {
      return res.status(409).json({ msg: "This username is taken." });
    }

    const newUser = await accountsQuery.createUser(username, hashedPassword);
    if (newUser) {
      return res.status(201).json({
        msg: "User created",
        newUser,
      });
    } else {
      return res.status(500).json({
        msg: "User wasn't created",
      });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

accountsRouter.get("/", async (req, res, next) => {
  try {
    const result = await accountsQuery.getAll();
    return res.json(result);
  } catch (error) {
    console.error("Error retrieving accounts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

accountsRouter.get("/:id", async (req, res, next) => {
  try {
    const result = await accountsQuery.getOneById(req.params.id);
    if (result) {
      return res.json(result);
    } else {
      return res.status(404).json({ msg: "Account not found." });
    }
  } catch (error) {
    console.error("Error retrieving account:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

accountsRouter.put("/:id", async (req, res, next) => {
  const { username, password } = req.body;
  const { id } = req.params;
  try {
    const result = await accountsQuery.changeInfo(id, username, password);
    if (result) {
      return res.json(result);
    } else {
      return res.status(404).json({ msg: "Account not found or not updated." });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = accountsRouter;
