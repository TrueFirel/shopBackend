import dotProp from "dot-prop";
import dotenv from "dotenv";
import fs from "fs";
import { parse } from "path";

export default class Config {
    public globalConfig: any = {};

    public async load() {
        dotenv.load();
        this.globalConfig.env = process.env;
        await this.loadConfig(this.globalConfig.env.CONFIG_PATH);

        return new Proxy(this.globalConfig, {
            get : (target, key) => {
                return target[key];
            },
        });
    }

    public async loadConfig(path: string) {
        const configs = await fs.promises.readdir(path);
        await Promise.all(configs.map(async (config) => {

            const configFilePath = `${path}/${config}`;
            const fileStat = await fs.promises.stat(configFilePath);

            if (!fileStat.isDirectory()) {
               const fileContent = await import(configFilePath);
               this.addConfig(parse(config).name, fileContent);
           } else {
               await this.loadConfig(configFilePath);
           }

        }));
    }

    private addConfig(dotPath: any, config: any) {
        dotProp.set(this.globalConfig, dotPath, config);
    }
}
