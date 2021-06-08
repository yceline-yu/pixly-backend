"use strict";

const request = require("supertest");

const app = require("../app");

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

/************************************** POST /images */

describe("POST /images", function () {
  const newImage = {
    name: "New Image",
    camera: "Canon",
    imageLocation: "Las Vegas",
    imageUrl: "http://newModel.test"
  };

  test("ok for user", async function () {
    const resp = await request(app)
        .post("/images")
        .send(newImage);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      image: {...newImage, id: expect.any(Number), style: "normal"},
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/images")
        .send({
          name: "new",
          camera: 10,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/images")
        .send({
          ...newImage,
          imageUrl: "not-a-url",
        })
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /images */

describe("GET /images", function () {
  test("ok for user", async function () {
    const resp = await request(app).get("/images");
    expect(resp.body).toEqual({
      images:
          [
            {
              id: testImageIds[0],
              name: "img1",
              camera: "Sony",
              style: "normal",
              imageLocation: "San Francisco",
              imageUrl: "http://route1.test",
            },
            {
              id: testImageIds[1],
              name: "img2",
              camera: "Nikon",
              style: "normal",
              imageLocation: "Los Angeles",
              imageUrl: "http://route2.test",
            },
            {
              id: testImageIds[2],
              name: "img3",
              camera: "Canon",
              style: "normal",
              imageLocation: "New York",
              imageUrl: "http://route3.test",
            },
          ],
    });
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get("/images")
        .query({ name: '2' });
    expect(resp.body).toEqual({
      images: [
        {
          id: testImageIds[1],
          name: "img2",
          camera: "Nikon",
          style: "normal",
          imageLocation: "Los Angeles",
          imageUrl: "http://route2.test",
        },
      ],
    });
  });

  test("works: filtering on all filters", async function () {
    const resp = await request(app)
        .get("/images")
        .query({ style: "normal", name: "1" });
    expect(resp.body).toEqual({
      images: [
        {
          id: testImageIds[0],
          name: "img1",
          camera: "Sony",
          style: "normal",
          imageLocation: "San Francisco",
          imageUrl: "http://route1.test",
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/images")
        .query({ name: "2", nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** GET /images/:id */

describe("GET /images/:id", function () {
  test("works for user", async function () {
    const resp = await request(app).get(`/images/${testImageIds[0]}`);
    expect(resp.body).toEqual({
      image: {
          id: testImageIds[0],
          name: "img1",
          camera: "Sony",
          style: "normal",
          imageLocation: "San Francisco",
          imageUrl: "http://route1.test",
        },
    });
  });

  test("not found for no such image", async function () {
    const resp = await request(app).get(`/images/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

// /************************************** PATCH /images/:id */

describe("PATCH /images/:id", function () {
  test("works for user", async function () {
    const resp = await request(app)
        .patch(`/images/${testImageIds[0]}`)
        .send({
          style: "black and white",
        })
    expect(resp.body).toEqual({
      image: {
        id: testImageIds[0],
        name: "img1",
        camera: "Sony",
        style: "black and white",
        imageLocation: "San Francisco",
        imageUrl: "http://route1.test",
      },
    });
  });

  test("not found on no such image", async function () {
    const resp = await request(app)
        .patch(`/images/0`)
        .send({
          name: "new 0",
        })
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/images/${testImageIds[0]}`)
        .send({
          id: 99,
        })
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/images/${testImageIds[0]}`)
        .send({
          name: 3,
        });
    expect(resp.statusCode).toEqual(400);
  });
});

// /************************************** DELETE /images/:id */

describe("DELETE /images/:id", function () {
  test("works for user", async function () {
    const resp = await request(app)
        .delete(`/images/${testImageIds[0]}`)
    expect(resp.body).toEqual({ deleted: `${testImageIds[0]}` });
  });

  test("not found for no such image", async function () {
    const resp = await request(app)
        .delete(`/images/0`)
    expect(resp.statusCode).toEqual(404);
  });
});
