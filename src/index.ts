import Config from "./app/Config";
import DBProcessor from "./app/DBProcessor";
import Server from "./app/HttpServer";

const CONFIG_PATH = "F:\\projects\\shopBackend\\config";
const ROUTES_PATH = "F:\\projects\\shopBackend\\dist\\routes";
const SCHEMAS_PATH = "F:\\projects\\shopBackend\\dist\\schemas";

( async () => {
    const config = await new Config().loadConfig(CONFIG_PATH);

    const dbProcessor = new DBProcessor(config.auth);
    await dbProcessor.importSchemas(SCHEMAS_PATH);
    await dbProcessor.createConnection();
    const httpServer = new Server(dbProcessor, config.app);

    await httpServer.importRoutes(ROUTES_PATH);
    await httpServer.start();

})();
