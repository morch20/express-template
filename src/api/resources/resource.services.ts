import { Resource } from "./resourceSchema";

const createResource = async (resource: Resource) => {
    // TODO: call database ORM and return new created resource
    return resource;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getResources = async (filter: any, options: any) => {
    // TODO: perform pagination and filtering with ORM and return array of resources
    return [
        {
            name: "resource",
            ip: "192.168.1.100",
        },
        {
            name: "resource2",
            ip: "192.168.1.101",
        },
    ];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getResourceById = async (id: number) => {
    // TODO: perform deletion with ORM
    return true;
};

const updateResourceById = async (resourceId: number, resource: Resource) => {
    // TODO: update resource with ORM
    return resource;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const deleteResourceById = async (resourceId: number) => {
    // TODO: delete resource with ORM
    return true;
};

const resourceService = {
    createResource,
    getResources,
    getResourceById,
    updateResourceById,
    deleteResourceById,
};

export default resourceService;
