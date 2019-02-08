import Config from "./app/Config";

const CONFIG_PATH = "F:\\projects\\shopBackend\\config";

( async () => {
    const config = await new Config().loadConfig(CONFIG_PATH);
})();