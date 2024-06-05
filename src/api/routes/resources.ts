import validate from "@/middlewares/validate";
import { Router } from "express";
import { paramsSchema, paginationSchema } from "@/lib/validations";
import { resourceSchema, resourceController } from "../resources";

const resourceRoute = Router();

resourceRoute
    .route("/")
    .post(
        validate(resourceSchema, "body"),
        resourceController.createResource
    )
    .get(validate(paginationSchema, "query"), resourceController.getResources);

// eslint-disable-next-line drizzle/enforce-delete-with-where
resourceRoute
    .route("/:id")
    .get(validate(paramsSchema, "params"), resourceController.getResource)
    .patch(
        validate(paramsSchema, "params"),
        validate(resourceSchema, "body"),
        resourceController.updateResource
    )
    .delete(
        validate(paramsSchema, "params"),
        resourceController.deleteResource
    );

export default resourceRoute;
