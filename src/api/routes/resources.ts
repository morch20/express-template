import validate from "@/middlewares/validate";
import { Router } from "express";
import { paramsSchema } from "@/lib/validations";
import { resourceSchema, resourceController } from "../resources";

const resourceRoute = Router();

resourceRoute
    .route("/")
    .post(
        validate(resourceSchema.resourceSchemaRequest, "body"),
        resourceController.createResource
    )
    .get(
        validate(resourceSchema.resourcesQuerySchema, "query"),
        resourceController.getResources
    );

// eslint-disable-next-line drizzle/enforce-delete-with-where
resourceRoute
    .route("/:id")
    .get(validate(paramsSchema, "params"), resourceController.getResource)
    .patch(
        validate(paramsSchema, "params"),
        validate(resourceSchema.resourceSchemaRequest, "body"),
        resourceController.updateResource
    )
    .delete(
        validate(paramsSchema, "params"),
        resourceController.deleteResource
    );

export default resourceRoute;
