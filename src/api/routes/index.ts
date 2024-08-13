import { Router } from "express";
import resourceRoute from "./resources";

const router = Router();

// resources route
router.use("/resources", resourceRoute);

export default router;
