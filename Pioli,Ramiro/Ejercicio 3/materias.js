import express from "express";
import { db } from "./db.js";
import { body, param, query, validationResult } from "express-validator";
const router = express.Router();

const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errores: validacion.array(),
    });
  }
  next();
};

const validarId = param("id").isInt({ min: 1 });

const validarBody = body("nombre").isAlpha("es-ES", { ignore: " " }).isLength({ max: 50 })

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM materias");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM materias WHERE id=?", [id]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "materia no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});

router.post("/", validarBody, verificarValidaciones, async (req, res) => {
  try {
    const { nombre } = req.body;

    const [result] = await db.execute(
      "INSERT INTO materias (nombre) VALUES (?)",
      [nombre]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, nombre },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.put("/:id",validarBody, validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre } = req.body;

    await db.execute("UPDATE materias SET nombre=? WHERE id=?", [nombre, id]);

    res.json({
      success: true,
      data: { id, nombre },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.delete("/:id",validarId, verificarValidaciones, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await db.execute("DELETE FROM materias WHERE id=?", [id]);

    res.json({ success: true, data: id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

