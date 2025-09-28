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

const validarBody = [body("base").isFloat({ min: 0.01 }), body("altura").isFloat({ min: 0.01 })]

router.get('/', async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM rectangulos");

  res.json({ success: true, data: rows });
});
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute("SELECT * FROM rectangulos WHERE id=?", [id]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "rectagulo no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});

router.post('/', validarBody, verificarValidaciones, async (req, res) => {
  const { base, altura } = req.body;

  const perimetro = 2 * (base + altura);
  const superficie = base * altura;

  const [result] = await db.execute(
    "INSERT INTO rectangulos (base, altura, superficie, perimetro) VALUES (?,?,?,?)",
    [base, altura, superficie, perimetro]
  );
  res.status(201).json({
    success: true,
    data: { id: result.insertId, base, altura, superficie, perimetro },
  });
});

router.put("/:id", validarId,validarBody ,verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  const { base, altura } = req.body;

  const perimetro = 2 * (base + altura);
  const superficie = base * altura;

  await db.execute(
    "UPDATE rectangulos SET base=?, altura=?, superficie=?, perimetro=? WHERE id=?",
    [base, altura, superficie, perimetro, id]
  );

  res.json({
    success: true,
    data: { id, base, altura, superficie, perimetro },
  });
});

router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {

  const id = Number(req.params.id);

  await db.execute("DELETE FROM rectangulos WHERE id=?", [id]);
  res.json({ success: true, data: id });
});


export default router;