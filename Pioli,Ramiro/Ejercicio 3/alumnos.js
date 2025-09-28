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

const validarBody = [body("alumnos").isAlpha("es-ES", { ignore: " " }).isLength({ max: 50 }), body("materia_id").isInt({ min: 1 }), body("nota1").isFloat({ min: 0 }), body("nota2").isFloat({ min: 0 }), body("nota3").isFloat({ min: 0 })]

router.get('/', async (req, res) => {

  let sql =
    "SELECT a.id, a.alumnos,m.nombre AS materias , a.nota1, a.nota2, a.nota3 " +
    "FROM alumnos a " +
    "JOIN materias m ON a.materia_id = m.id " +
    "ORDER BY a.alumnos";

  const [rows] = await db.execute(sql);

  res.json({ success: true, data: rows });
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM alumnos WHERE id=?", [id]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "alumno no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});
router.post('/', validarBody, verificarValidaciones, async (req, res) => {
  const { alumnos, materia_id, nota1, nota2, nota3 } = req.body;

  try {
    const [result] = await db.execute(
      "INSERT INTO alumnos (alumnos, materia_id, nota1, nota2, nota3) VALUES (?,?,?,?,?)",
      [alumnos, materia_id, nota1, nota2, nota3]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, alumnos, materia_id, nota1, nota2, nota3 },
    });

  } catch (error) {
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "materia no encontrada",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error en el servidor",
    });
  }
});

router.put("/:id", validarId, validarBody, verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  const { alumnos, materia_id, nota1, nota2, nota3 } = req.body;


  await db.execute(
    "UPDATE alumnos SET alumnos=?, materia_id=?, nota1=?, nota2=?, nota3=? WHERE id=?",
    [alumnos, materia_id, nota1, nota2, nota3, id]
  );

  res.json({
    success: true,
    data: { id, alumnos, materia_id, nota1, nota2, nota3 },
  });
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  await db.execute("DELETE FROM alumnos WHERE id=?", [id]);
  res.json({ success: true, data: id });
});

export default router;