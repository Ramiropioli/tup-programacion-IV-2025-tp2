import express from "express";
import { conectarDB } from "./db.js";
import alumnosRouter from "./alumnos.js";
import materiasRouter from "./materias.js";


conectarDB();

const app = express();
const port = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hola mundo!");
});

app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);

app.listen(port, () => {
    console.log(`La aplicación esta funcionando en el puerto ${port}`);
});