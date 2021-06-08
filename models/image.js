"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for images. */

class Image {
  /** Add an image (from data), update db, return new image data.
   *
   * data should be { name, camera, imageUrl, imageLocation }
   *
   * Returns { id, name, camera, style, imageUrl, imageLocation }
   *
   * Throws BadRequestError if image already in database.
   * */

  static async add({ name, camera, imageUrl, imageLocation }) {
    const duplicateCheck = await db.query(
      `SELECT name
           FROM images
           WHERE name = $1`,
      [name]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate image: ${name}`);

    const result = await db.query(
      `INSERT INTO images
         ( name, camera, image_url, image_location )
           VALUES
             ($1, $2, $3, $4 )
           RETURNING id, 
                    name,
                    camera,
                    style, 
                    image_url as "imageUrl", 
                    image_location as "imageLocation" `,
      [
        name,
        camera,
        imageUrl,
        imageLocation
      ],
    );
    const image = result.rows[0];

    return image;
  }

  /** Create WHERE clause for filters, to be used by functions that query
   * with filters.
   *
   * searchFilters (all optional):
   * - style (will find case-insensitive, partial matches)
   * - name (will find case-insensitive, partial matches)
   * - imageLocation (will find case-insensitive, partial matches)
   * - camera (will find case-insensitive, partial matches)
   *
   * Returns {
   *  where: "WHERE style ILIKE $1 AND name ILIKE $2",
   *  vals: ['%normal%', '%Test%']
   * }
   */

  static _filterWhereBuilder({ name, style, imageLocation, camera }) {
    let whereParts = [];
    let vals = [];

    if (style) {
      vals.push(`%${style}%`);
      whereParts.push(`style ILIKE $${vals.length}`);
    }

    if (name) {
      vals.push(`%${name}%`);
      whereParts.push(`name ILIKE $${vals.length}`);
    }

    if (imageLocation) {
      vals.push(`%${imageLocation}%`);
      whereParts.push(`image_location ILIKE $${vals.length}`);
    }

    if (camera) {
      vals.push(`%${camera}%`);
      whereParts.push(`camera ILIKE $${vals.length}`);
    }

    const where = (whereParts.length > 0) ?
      "WHERE " + whereParts.join(" AND ")
      : "";

    return { where, vals };
  }

  /** Find all images (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - style (will find case-insensitive, partial matches)
   * - name (will find case-insensitive, partial matches)
   * - imageLocation (will find case-insensitive, partial matches)
   * - camera (will find case-insensitive, partial matches)
   *
   * Returns [{ id, name, style, camera, imageLocation, imageUrl }, ...]
   * */

  static async findAll(searchFilters = {}) {
    const { name, style, imageLocation, camera } = searchFilters;

    const { where, vals } = this._filterWhereBuilder({
      name, style, imageLocation, camera
    });

    const imagesRes = await db.query(`
      SELECT id,
             name,
             style,
             camera,
             image_location AS "imageLocation",
             image_url AS "imageUrl"
        FROM images ${where}
        ORDER BY name
    `, vals);
    return imagesRes.rows;
  }

  /** Given an image id, return data about image.
   *
   * Returns { id, name, style, camera, imageLocation, imageUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const imagesRes = await db.query(
      `SELECT id,
                name,
                style,
                camera,
                image_location AS "imageLocation",
                image_url AS "imageUrl"
           FROM images
           WHERE id = $1`,
      [id]);

    const image = imagesRes.rows[0];

    if (!image) throw new NotFoundError(`No image found`);

    return image;
  }

  /** Update image data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, style}
   *
   * Returns { id, name, style, camera, imageLocation, imageUrl }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE images
                      SET ${setCols}
                        WHERE id = ${idVarIdx}
                        RETURNING id, name, style, camera, image_location AS "imageLocation", image_url AS "imageUrl"`;
    const result = await db.query(querySql, [...values, id]);
    const image = result.rows[0];

    if (!image) throw new NotFoundError(`No image found`);

    return image;
  }

  /** Delete given image from database; returns undefined.
   *
   * Throws NotFoundError if image not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM images
           WHERE id = $1
           RETURNING id`,
      [id]);
    const image = result.rows[0];

    if (!image) throw new NotFoundError(`No image`);
  }
}


module.exports = Image;
