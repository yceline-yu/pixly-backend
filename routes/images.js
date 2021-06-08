"use strict";

/** Routes for images. */

const jsonschema = require("jsonschema");
const express = require("express");
const router = new express.Router();

const { BadRequestError } = require("../expressError");
const Image = require("../models/image");

const imageNewSchema = require("../schemas/imageNew.json");
const imageSearchSchema = require("../schemas/imageSearch.json");
const imageUpdateSchema = require("../schemas/imageUpdate.json");

/** GET / => 
 *    { images: [{ id, name, camera, style, imageUrl, imageLocation }, ...] }
 * 
 * Retrieves images from database 
 * 
 * Can filter by the following:
 * - style
 * - name
 * - imageLocation
 * - camera
 * 
 * 
 * returns [{ id, name, camera, style, imageUrl, imageLocation }, ...]
 */
router.get("/", async function (req, res, next) {
  const q = req.query;
  const validator = jsonschema.validate(q, imageSearchSchema);

  if(!validator.valid){
    const errs = validator.errors.map( e => e.stack );
    throw new BadRequestError(errs);
  }

  const images = await Image.findAll(q);

  return res.json({ images });
});

/** GET /[id] => { image }
 * 
 * Retrieves information about a single image
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
 */
router.get("/:id", async function (req, res, next) {
  const image = await Image.get(req.params.id);

  return res.json({ image });
});

/** POST / { image }=> { image } 
 * 
 * adds new image info to database
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
*/
router.post("/", async function (req, res, next) {
  const validator = jsonschema.validate(req.body, imageNewSchema);
  if(!validator.valid){
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const image = await Image.add(req.body);

  return res.status(201).json({ image });
});

/** PATCH /:id { name, style } => { image } 
 * 
 * Patches image data
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
*/
router.patch("/:id", async function (req, res, next) {
  const validator = jsonschema.validate(req.body, imageUpdateSchema);
  if(!validator.valid){
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const image = await Image.update(req.params.id, req.body)

  return res.json({ image })
});

/** DELETE /:id  => { deleted: :id }
*/
router.delete("/:id", async function (req, res, next) {
  await Image.remove(req.params.id);

  return res.json({ deleted: req.params.id })
})

module.exports = router;
