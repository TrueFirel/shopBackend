import Config from "./app/Config";
import DBProcessor from "./app/DBProcessor";
import Server from "./app/HttpServer";

( async () => {
    const config = await new Config().load();

    const dbProcessor = new DBProcessor(config.env.SECRET);
    await dbProcessor.importSchemas(config.env.SCHEMAS_PATH);
    await dbProcessor.createConnection();
    const httpServer = new Server(dbProcessor, { host: config.env.HOST, port: config.env.PORT });

    await httpServer.importRoutes(config.env.ROUTES_PATH);
    await httpServer.start();

})();
