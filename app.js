"use strict";

const express = require("express");

const { NotFoundError } = require("./expressError");

const imageRoutes = require("./routes/images");

const app = express();

app.use(express.json());

app.use("/images", imageRoutes);



/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;