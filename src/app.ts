import express from "express";

import "./databases/prisma/connection";
import celebrateCustomErros from "./middlewares/celebrateCustomErros";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use(routes);

app.use(celebrateCustomErros);

export default app;
