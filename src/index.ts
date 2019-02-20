import Config from "./app/Config";
import DBProcessor from "./app/DBProcessor";
import Server from "./app/HttpServer";

( async () => {
    const config = await new Config().load();

    const dbProcessor = new DBProcessor({ private_key: config.env.SECRET });
    await dbProcessor.importSchemas(config.env.SCHEMAS_PATH);
    await dbProcessor.createConnection();
    const httpServer = new Server(dbProcessor, config);

    await httpServer.importRoutes(config.env.ROUTES_PATH);
    await httpServer.start();

})();
