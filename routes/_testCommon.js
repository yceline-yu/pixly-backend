"use strict";

const db = require("../db.js");
const Image = require("../models/image");

const testImageIds = [];

async function commonBeforeAll() {

  await db.query("DELETE FROM images");

  testImageIds[0] = (await Image.add(
      { name: "img1", camera: "Sony", imageLocation: "San Francisco", imageUrl: "http://route1.test" })).id;
  testImageIds[1] = (await Image.add(
      { name: "img2", camera: "Nikon", imageLocation: "Los Angeles", imageUrl: "http://route2.test" })).id;
  testImageIds[2] = (await Image.add(
      { name: "img3", camera: "Canon", imageLocation: "New York", imageUrl: "http://route3.test" })).id;

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}



module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
};
