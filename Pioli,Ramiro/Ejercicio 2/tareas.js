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

const validarId = param("id").isInt({ min: 1 })

const validarBody = [body("tarea").isAlpha("es-ES", { ignore: " " }).isLength({ max: 50 }), body("terminado").isBoolean().toBoolean()]

const validarFiltros = query("completadas").isBoolean().optional()

router.get('/', validarFiltros, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];


  const { tarea, completadas } = req.query;

  if (tarea) {
    filtros.push("tarea LIKE ?");
    parametros.push(`%${tarea}%`);
  }

  if (completadas !== undefined) {

    const terminado = completadas === "true" ? 1 : 0;
    filtros.push("terminado = ?");
    parametros.push(terminado);
  }

  let sql = "SELECT * FROM tareas";
  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  const [rows] = await db.execute(sql, parametros);

  res.json({ success: true, data: rows });
});

router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM tareas WHERE id=?", [id]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "tarea no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});

router.post('/', validarBody, verificarValidaciones, async (req, res) => {
  const { tarea, terminado } = req.body;


  const [result] = await db.execute(
    "INSERT INTO tareas (tarea, terminado) VALUES (?,?)",
    [tarea, terminado]
  );
  res.status(201).json({
    success: true,
    data: { id: result.insertId, tarea, terminado },
  });
});

router.put("/:id", validarId, validarBody, verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  const { tarea, terminado } = req.body;


  await db.execute(
    "UPDATE tareas SET tarea=?, terminado=? WHERE id=?",
    [tarea, terminado, id]
  );

  res.json({
    success: true,
    data: { tarea, terminado, id },
  });
});


router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  await db.execute("DELETE FROM tareas WHERE id=?", [id]);
  res.json({ success: true, data: id });
});

export default router;