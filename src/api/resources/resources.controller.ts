import { AppError } from "@/lib/errors";
import { catchAsync } from "@/lib/utils/functionts";
import httpStatus from "http-status";
import resourceService from "./resource.services";

const createResource = catchAsync(async (req, res) => {
    const user = await resourceService.createResource(req.body);
    res.status(httpStatus.CREATED).send(user);
});

const getResources = catchAsync(async (req, res) => {
    // TODO: validate filters and pagination and throw error
    const filter = {};
    const options = {};
    const result = await resourceService.getResources(filter, options);
    res.status(httpStatus.OK).send(result);
});

const getResource = catchAsync(async (req, res) => {
    // TODO: validate userId and throw error
    const userId = Number(req.params.userId) || 0;

    const user = await resourceService.getResourceById(userId);
    if (!user) {
        throw new AppError("User not found", httpStatus.NOT_FOUND);
    }
    res.status(httpStatus.OK).send(user);
});

const updateResource = catchAsync(async (req, res) => {
    // TODO: validate userId and throw error
    const userId = Number(req.params.userId) || 0;

    const user = await resourceService.updateResourceById(userId, req.body);
    res.status(httpStatus.OK).send(user);
});

const deleteResource = catchAsync(async (req, res) => {
    // TODO: validate userId and throw error
    const userId = Number(req.params.userId) || 0;

    await resourceService.deleteResourceById(userId);
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
