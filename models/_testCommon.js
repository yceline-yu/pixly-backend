const db = require("../db.js");

const testImageIds = [];

async function commonBeforeAll() {
  await db.query('DELETE FROM images');

  const resultsImages = await db.query(`
  INSERT INTO images (name, camera, image_location, image_url)
  VALUES ('modelTest1', 'Sony', 'San Francisco', 'http://model.test'),
          ('modelTest2', 'Leica', 'Los Angeles', 'http://model2.test')
  RETURNING id`);
  testImageIds.splice(0, 0, ...resultsImages.rows.map(r => r.id));
}

async function commonBeforeEach() {
  await db.query('BEGIN');
}

async function commonAfterEach() {
  await db.query('ROLLBACK');
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