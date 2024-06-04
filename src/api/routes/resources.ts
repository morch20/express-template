import validate from "@/middlewares/validate";
import { Router } from "express";
import { resourceSchema, resourceController } from "../resources";

const resourceRoute = Router();

resourceRoute
    .route("/")
    .post(validate(resourceSchema, "body"), resourceController.createResource)
    .get(resourceController.getResources);

// eslint-disable-next-line drizzle/enforce-delete-with-where
resourceRoute
    .route("/:id")
    .get(resourceController.getResource)
    .patch(validate(resourceSchema, "body"), resourceController.updateResource)
    .delete(resourceController.deleteResource);

export default resourceRoute;
