import { Router } from "express";

// CONTROLLERS
import sessionController from "./controllers/sessionController";
import userController from "./controllers/userController";
import addressController from "./controllers/addressController";
import orderController from "./controllers/orderController";
import categoryController from "./controllers/categoryController";
import productController from "./controllers/productController";

// VALIDATORS
import sessionValidator from "./controllers/sessionController/validators";
import userValidator from "./controllers/userController/validators";
import addressValidator from "./controllers/addressController/validators";
import orderValidator from "./controllers/orderController/validators";
import categoryValidator from "./controllers/categoryController/validators";
import productValidator from "./controllers/productController/validators";

import jwtAuthentication from "./middlewares/jwtAuthentication";
import adminJwtAuthentication from "./middlewares/adminJwtAuthentication";

const router = Router();

// SESSION
router.post("/sessions", sessionValidator.store, sessionController.store);

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
router.put(
  "/addresses/:id",
  addressValidator.update,
  jwtAuthentication,
  addressController.update
);
router.delete(
  "/addresses/:id",
  addressValidator.destroy,
  jwtAuthentication,
  addressController.destroy
);

// ORDERS
router.get(
  "/orders",
  orderValidator.list,
  jwtAuthentication,
  orderController.list
);
router.post(
  "/orders",
  orderValidator.store,
  jwtAuthentication,
  orderController.store
);

// PRODUCTS
router.post(
  "/products",
  productValidator.store,
  adminJwtAuthentication,
  productController.store
);

// CATEGORIES
router.post(
  "/categories",
  categoryValidator.store,
  adminJwtAuthentication,
  categoryController.store
);

export default router;
