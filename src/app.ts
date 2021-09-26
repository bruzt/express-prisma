import express from "express";

import "./databases/prisma/connection";
import routes from "./routes";

const app = express();
app.use(express.json());

app.use(routes);

export default app;
