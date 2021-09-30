import { Router } from "express";

// CONTROLLERS
import sessionController from "./controllers/sessionController";
import userController from "./controllers/userController";
import addressController from "./controllers/addressController";

// VALIDATORS
import sessionValidator from "./controllers/sessionController/validators";
import userValidator from "./controllers/userController/validators";
import addressValidator from "./controllers/addressController/validators";

import jwtAuthentication from "./middlewares/jwtAuthentication";
import adminJwtAuthentication from "./middlewares/adminJwtAuthentication";

const router = Router();

// SESSION
router.post("/session", sessionValidator.store, sessionController.store);

// USER
router.get(
  "/users",
  adminJwtAuthentication,
  userValidator.list,
  userController.list
);
router.get(
  "/users/:id",
  userValidator.show,
  jwtAuthentication,
  userController.show
);
router.post("/users", userValidator.store, userController.store);
router.put(
  "/users",
  userValidator.update,
  jwtAuthentication,
  userController.update
);
router.delete(
  "/users",
  userValidator.destroy,
  jwtAuthentication,
  userController.destroy
);

// ADDRESSES
router.get(
  "/addresses",
  addressValidator.list,
  jwtAuthentication,
  addressController.list
);
router.post(
  "/addresses",
  addressValidator.store,
  jwtAuthentication,
  addressController.store
);

export default router;
