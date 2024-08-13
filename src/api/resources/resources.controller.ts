import { AppError } from "@/lib/errors";
import httpStatus from "http-status";
import { catchAsync } from "@/lib/utils/functions";
import resourceService from "./resource.services";

const createResource = catchAsync(async (req, res) => {
    // The validation middleware makes sure that the request body is a valid ResourceSchemaRequest
    const result = await resourceService.createResource(req.body);

    if (!result) {
        throw new AppError(
            "Error creating resource",
            httpStatus.INTERNAL_SERVER_ERROR
        );
    }

    res.status(httpStatus.CREATED).json(result);
});

const getResources = catchAsync(async (req, res) => {
    // The validation middleware makes sure "page" and "amount" are valid strings
    // The default values are page = 1, amount = 10. Located in @/lib/validations
    const page = Number(req.query.page);
    const amount = Number(req.query.amount);

    // The validation is handled in the middleware as well. Look at the resource route!
    const name = req.query.name as string;

    const result = await resourceService.getResources(page, amount, name);
    res.status(httpStatus.OK).json(result);
});

const getResource = catchAsync(async (req, res) => {
    // The validation middleware makes sure "id" is a valid number
    const id = Number(req.params.id);

    const resource = await resourceService.getResourceById(id);
    if (!resource) {
        throw new AppError("Resource not found", httpStatus.NOT_FOUND);
    }
    res.status(httpStatus.OK).json(resource);
});

const updateResource = catchAsync(async (req, res) => {
    // The validation middleware makes sure "id" is a valid number
    const id = Number(req.params.id);

    const updatedResource = await resourceService.updateResourceById(
        id,
        req.body
    );

    if (!updatedResource) {
        throw new AppError(
            "Error updating resource",
            httpStatus.INTERNAL_SERVER_ERROR
        );
    }

    res.status(httpStatus.OK).json(updatedResource);
});

const deleteResource = catchAsync(async (req, res) => {
    // The validation middleware makes sure "id" is a valid number
    const id = Number(req.params.id);

    await resourceService.deleteResourceById(id);
    res.status(httpStatus.NO_CONTENT).send();
});

const resourceController = {
    createResource,
    getResources,
    getResource,
    updateResource,
    deleteResource,
};

export default resourceController;
