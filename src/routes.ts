import { Router } from "express";

import userController from "./controllers/userController";
import sessionController from "./controllers/sessionController";

import jwtAuthentication from "./middlewares/jwtAuthentication";

const router = Router();

router.post("/session", sessionController.store);

router.get("/user", userController.list);
router.get("/user/:id", jwtAuthentication, userController.show);
router.post("/user", userController.store);
router.put("/user/:id", jwtAuthentication, userController.update);
router.delete("/user/:id", jwtAuthentication, userController.destroy);

export default router;
