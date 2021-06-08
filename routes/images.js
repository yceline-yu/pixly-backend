"use strict";

/** Routes for authentication. */

const express = require("express");
const router = new express.Router();

const { BadRequestError } = require("../expressError");
const Image = require("../models/image")

/** GET / => 
 *    { images: [{ id, name, camera, style, imageUrl, imageLocation }, ...] }
 * 
 * Retrieves images from database 
 * 
 * Can filter by the following:
 * - name
 * - camera
 * - imageLocation
 * 
 * 
 * returns [{ id, name, camera, style, imageUrl, imageLocation }, ...]
 */
router.get("/", async function (req, res, next){
  const q = req.query;

  const images = await Image.findAll(q);

  return res.json({ images });
});

/** GET /[id] => { image }
 * 
 * Retrieves information about a single image
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
 */
router.get("/:id", async function (req, res, next){
  const image = await Image.get(req.params.id);

  return res.json({ image });
});

/** POST / { image }=> { image } 
 * 
 * adds new image info to database
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
*/
router.post("/", async function(req, res, next){
  const image = await Image.add(req.body);

  return res.status(201).json({ image });
});

/** PATCH /:id { name, style } => { image } 
 * 
 * Patches image data
 * 
 * returns { id, name, camera, style, imageUrl, imageLocation }
*/
router.patch("/:id", async function (req, res, next){
  const image = await Image.update(req.params.id, req.body)

  return res.json({ image })
});

router.delete("/:id", async function(req,res,next){
  await Image.remove(req.paras.id);

  return res.json({ deleted: req.params.id })
})

module.exports = router;
