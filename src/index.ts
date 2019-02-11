import Config from "./app/Config";
import Server from "./app/HttpServer";

const CONFIG_PATH = "F:\\projects\\shopBackend\\config";

( async () => {
    const config = await new Config().loadConfig(CONFIG_PATH);
    const httpServer = new Server(config.app);
    await httpServer.start();
})();