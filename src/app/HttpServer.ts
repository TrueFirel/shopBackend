import express, { Express, Router } from 'express';
import { promises } from "fs";
import { parse } from "path";
import { Server } from "http";
import cors from "cors";
import httpError from "http-errors";
import * as bodyParser from "body-parser";
import DBProcessor from "./DBProcessor";

interface IServerOprions {
    port: number,
    host: string
}

export default class HttpServer {
    protected expressApp: Express;
    protected options: IServerOprions;
    protected expressRouter: Router;
    protected dbConnection: DBProcessor;
    public httpServer: Server;

    constructor(dbConnection: DBProcessor, options: IServerOprions) {
        this.expressApp = express();
        this.options = options;
        this.dbConnection = dbConnection;
        this.expressRouter = express.Router();
        this.httpServer = new Server();
    }

    public async start() {
        this.expressApp.use(express.json());
        this.expressApp.use(cors());
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded());
        this.expressApp.use(this.expressRouter);
        this.expressRouter.use("", () => {
            throw new httpError.NotFound("Wrong path");
        });
        this.expressApp.use(HttpServer.errorHandler.bind(this));

        this.httpServer = await this.expressApp.listen(this.options, () => {
            console.log(`HTTP server was started on adress //${this.options.host}:${this.options.port}`);
        });

    }

    protected static errorHandler(err: any, req: any, res: any, next: any) {
        res.status(err.status || 500);
        res.json(typeof err.message === "string" ? {message: err.message} : err.message);
        !err.status && next(err);
    }

    public async importRoute(filename: string) {
        const { "default": routes } = await import(filename);

        if(routes.call) {
            return routes.call(this.expressRouter, this.dbConnection)
        }
    }

    public async importRoutes(path: string) {
        const files = await promises.readdir(path);
        await Promise.all(files.map( async(file: any) => {
            const filePath = `${path}\\${file}`;
            const stat = await promises.stat(filePath);
            if(stat.isDirectory()) await this.importRoutes(filePath);
            if(parse(file).ext === ".js") this.importRoute(filePath);
        }));
    }
}