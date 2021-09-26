import { Router } from "express";

import userController from "./controllers/userController";
import sessionController from "./controllers/sessionController";

const router = Router();

router.post("/session", sessionController.store);

router.get("/user", userController.list);
router.post("/user", userController.store);
router.put("/user/:id", userController.update);
router.delete("/user/:id", userController.destroy);

export default router;
