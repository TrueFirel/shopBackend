import express, {Express} from 'express';
import Config from "./Config";
import { promises } from "fs";
import { parse} from "path";

export default class ExpressServer {
    protected server: Express;
    protected config: Config;
    protected routes: any = [];

    constructor(config: any) {
        this.config = config;
        this.server = express();
    }

    public async start() {

    }

    public async loadRoute(filename: string) {
        const route = await import(filename);
        this.routes.push(route);
    }

    public async loadRoutes(path: string) {
        const files = await promises.readdir(path);
        await Promise.all(files.map( async(file: any) => {
            const filePath = `${path}\\${file}`;
            const stat = await promises.stat(filePath);
            if(stat.isDirectory()) {
                await this.loadRoutes(filePath);
                return;
            }
            if(parse(filePath).ext === ".js") this.loadRoute(filePath);
        }))
    }
}