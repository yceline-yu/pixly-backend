"use strict";

const { fail } = require("assert/strict");
const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Image = require("./image.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testImageIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);



// /*************************************** add */

describe("add", function () {
  const newImage = {
    name: "New Image",
    camera: "Canon",
    imageLocation: "Las Vegas",
    imageUrl: "http://newModel.test"
  };

  it("works", async function () {
    let image = await Image.add(newImage);
    expect(image).toEqual({
      ...newImage,
      id: expect.any(Number),
      style: "normal"
    });

    const result = await db.query(
      `SELECT id, name, camera, style, image_location, image_url
      FROM images
      WHERE name = 'New Image'`);

    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        name: "New Image",
        camera: "Canon",
        style: "normal",
        image_location: "Las Vegas",
        image_url: "http://newModel.test"
      },
    ]);
  });

  it("bad request with dupe", async function () {
    try {
      await Image.add(newImage);
      await Image.add(newImage);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
/*********************************** _filterWhereBuilder */

describe("_filterWhereBuilder", function () {
  it("works with no filter criteria", function () {
    const criteria = {};

    expect(Image._filterWhereBuilder(criteria)).toEqual({
      where: "",
      vals: [],
    });
  });

  it("works with name", function () {
    const criteria = {
      name: "test",
    };

    expect(Image._filterWhereBuilder(criteria)).toEqual({
      where: "WHERE name ILIKE $1",
      vals: ['%test%'],
    });
  });

  it("works with style", function () {
    const criteria = {
      style: "normal",
    };

    expect(Image._filterWhereBuilder(criteria)).toEqual({
      where: "WHERE style ILIKE $1",
      vals: ['%normal%'],
    });
  });

  it("works when all criteria options supplied", function () {
    const criteria = {
      name: "Test",
      style: "normal",
      imageLocation:"San Francisco",
      camera: "Nikon"
    };

    expect(Image._filterWhereBuilder(criteria)).toEqual({
      where: "WHERE style ILIKE $1 AND name ILIKE $2 AND image_location ILIKE $3 AND camera ILIKE $4",
      vals: ["%normal%", "%Test%", "%San Francisco%", "%Nikon%"],
    });
  });
});

/************************************** findAll */
/**
 *  NOTE: Some of the find all tests are already handled
 *  now that we're testing the filter criteria at
 *  a lower level with _filterWhereBuilder.
 *
 *  We've decided these tests are still useful and
 *  all should continue to pass.
 */
 describe("findAll", function () {
  test("works: all", async function () {
    let images = await Image.findAll();
    expect(images).toEqual([
      {
        id: testImageIds[0],
        name: "modelTest1",
        camera: "Sony",
        style: "normal",
        imageLocation: "San Francisco",
        imageUrl: "http://model.test",
      },
      {
        id: testImageIds[1],
        name: "modelTest2",
        camera: "Leica",
        style: "normal",
        imageLocation: "Los Angeles",
        imageUrl: "http://model2.test",
      },
    ]);
  });

  it("works: by style", async function () {
    let images = await Image.findAll({ style: "normal" });
    expect(images).toEqual([
      {
        id: testImageIds[0],
        name: "modelTest1",
        camera: "Sony",
        style: "normal",
        imageLocation: "San Francisco",
        imageUrl: "http://model.test",
      },
      {
        id: testImageIds[1],
        name: "modelTest2",
        camera: "Leica",
        style: "normal",
        imageLocation: "Los Angeles",
        imageUrl: "http://model2.test",
      },
    ]);
  });

  it("works: by name", async function () {
    let images = await Image.findAll({ name: "2" });
    expect(images).toEqual([
      {
        id: testImageIds[1],
        name: "modelTest2",
        camera: "Leica",
        style: "normal",
        imageLocation: "Los Angeles",
        imageUrl: "http://model2.test",
      },
    ]);
  });

  it("works: empty list on nothing found", async function () {
    let images = await Image.findAll({ name: "nope" });
    expect(images).toEqual([]);
  });

});

/************************************** get */

describe("get", function () {
  it("works", async function () {
    let image = await Image.get(testImageIds[0]);
    expect(image).toEqual({
        id: testImageIds[0],
        name: "modelTest1",
        camera: "Sony",
        style: "normal",
        imageLocation: "San Francisco",
        imageUrl: "http://model.test",
    });
  });

  it("not found if no such image", async function () {
    try {
      await Image.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New Name",
    style: "New Style",
  };

  test("works", async function () {
    let image = await Image.update(testImageIds[0], updateData);
    expect(image).toEqual({
      id: testImageIds[0],
      ...updateData,
      camera: "Sony",
      imageLocation: "San Francisco",
      imageUrl: "http://model.test",
    });

    const result = await db.query(
      `SELECT id, name, camera, style, image_location, image_url
      FROM images
      WHERE name = 'New Name'`);

    expect(result.rows).toEqual([
      {
        id: testImageIds[0],
        name: "New Name",
        camera: "Sony",
        style: "New Style",
        image_location: "San Francisco",
        image_url: "http://model.test"
      },
    ]);
  });

  test("not found if no such company", async function () {
    try {
      await Image.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Image.update(0, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Image.remove(testImageIds[0]);
    const res = await db.query(
        "SELECT name FROM images WHERE name='modelTest1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Image.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});