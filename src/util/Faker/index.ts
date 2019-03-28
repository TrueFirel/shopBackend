import Config from "../../app/Config";
import DBProcessor from "../../app/DBProcessor";
import Logger from "../Logger";
import Faker from "./Faker";

const logger = new Logger();

(async () => {
    try {
        logger.info("Starting Faker");
        const config = await new Config().load();
        const dbProcessor = new DBProcessor({ private_key: config.env.SECRET });
        await dbProcessor.importSchemas(config.env.SCHEMAS_PATH);
        await dbProcessor.createConnection();

        const faker = new Faker(dbProcessor, config);
        const users = await faker.addUsers(config.env.FAKE_USERS_AMOUNT);
        logger.info(`${users.length} users successfully added`);

        const shops = await faker.addShops(config.env.FAKE_SHOPS_AMOUNT);
        logger.info(`${shops.length} shops successfully added`);

        const bunchOfProducts: any[] = [];
        for (const shop of shops) {
            const products = await faker.addProducts(shop, config.env.FAKE_PRODUCTS_AMOUNT);
            bunchOfProducts.push(products);
            logger.info(`${products.length} products successfully added to shop: ${shop.company_name}`);
        }

        for (const user of users) {
            for (const products of bunchOfProducts) {
                for (const product of products) {
                    await faker.addReview(user, product);
                    logger.info(`review of user ${user.name} successfully added`);
                }

                const favorites = await faker.addFavorite(user, products);
                logger.info(`${favorites.length} favorites successfully added for user ${user.name}`);            }
        }

    } catch (err) {
        logger.error(err);
    } finally {
        process.exit();
    }
})();
