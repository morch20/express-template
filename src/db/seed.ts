import { logger } from "@/lib/logger";
import { ResourceRequest } from "@/api/resources/resourceSchema";
import db from ".";
import { resource } from "./schema";

const resourceSeedingData: ResourceRequest[] = [
    {
        name: "Seguente-utility",
        ip: "127.0.0.0",
    },
];

async function main() {
    for (let index = 0; index < resourceSeedingData.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await db
            .insert(resource)
            .values(resourceSeedingData[index])
            .onConflictDoNothing();
    }
}

main().catch((e) => {
    logger.fatal("Fatal error seeding database:", e);
    process.exit(1);
});
