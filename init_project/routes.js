const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
// const admin = require("../routes/admin");

module.exports = function (app) {
  app.use(express.json());
  app.use("/users", users);
  app.use("/auth", auth);
  // app.use("/admin", admin);
};
