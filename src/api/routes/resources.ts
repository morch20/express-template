import validate from "@/middlewares/validate";
import { Router } from "express";
import { resourceSchema, resourceController } from "../resources";

const resourceRoute = Router();

resourceRoute
    .route("/")
    .post(validate(resourceSchema), resourceController.createResource)
    .get(resourceController.getResources);

// eslint-disable-next-line drizzle/enforce-delete-with-where
resourceRoute
    .route("/:userId")
    .get(resourceController.getResource)
    .patch(validate(resourceSchema), resourceController.updateResource)
    .delete(resourceController.deleteResource);

export default resourceRoute;
