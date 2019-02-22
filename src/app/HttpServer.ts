import * as bodyParser from "body-parser";
import cors from "cors";
import express, { Express, Router } from "express";
import { promises } from "fs";
import { Server } from "http";
import httpError from "http-errors";
import { parse } from "path";
import BaseResource from "../resources/BaseResource";
import Logger from "../util/Logger";
import Config from "./Config";
import DBProcessor from "./DBProcessor";
import MessageClient from "./MessageClient";

export default class HttpServer {

    protected static errorHandler(err: any, req: any, res: any, next: any) {
        res.status(err.status || 500);
        res.json(typeof err.message === "string" ? {message: err.message} : err.message);
        if (!err.status) next(err);
    }

    protected static resourceHandler(resource: any, req: any, res: any, next: any) {
        if (resource instanceof BaseResource) {
            res.json(resource.uncover());
        } else next(resource);
    }
    public httpServer: Server;
    protected expressApp: Express;
    protected config: any;
    protected expressRouter: Router;
    protected dbProcessor: DBProcessor;
    protected logger: Logger;
    protected messageClient: MessageClient;

    constructor(dbConnection: DBProcessor, config: Config) {
        this.expressApp = express();
        this.config = config;
        this.dbProcessor = dbConnection;
        this.expressRouter = express.Router();
        this.httpServer = new Server();
        this.logger = new Logger();
        this.messageClient = new MessageClient({
            sid: this.config.env.TWILLIO_SID,
            token: this.config.env.TWILLIO_TOKEN,
            number: this.config.env.TWILLIO_NUMBER,
        });
    }

    public async start() {
        this.expressApp.use(express.json());
        this.expressApp.use(cors());
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded());
        this.expressApp.use(this.expressRouter);
        this.expressRouter.use("", () => {
            throw new httpError.NotFound("wrong path");
        });
        this.expressApp.use(HttpServer.resourceHandler.bind(this));
        this.expressApp.use(HttpServer.errorHandler.bind(this));

        this.httpServer = await this.expressApp.listen(
            { host: this.config.env.HOST, port: this.config.env.PORT }, () => {
            this.logger.info(`HTTP server was started on adress //${this.config.env.HOST}:${this.config.env.PORT}`);
        });

    }

    public async importRoute(filename: string) {
        const { "default": routes } = await import(filename);

        if (routes.call) {
            return routes.call(this.expressRouter, this.dbProcessor, this.messageClient);
        }
    }

    public async importRoutes(path: string) {
        const files = await promises.readdir(path);
        await Promise.all(files.map( async (file: any) => {
            const filePath = `${path}/${file}`;
            const stat = await promises.stat(filePath);
            if (stat.isDirectory()) await this.importRoutes(filePath);
            if (parse(file).ext === ".js") this.importRoute(filePath);
        }));
    }
}
