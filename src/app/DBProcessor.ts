import Realm from "realm";
import jwt from "jsonwebtoken";
import { promises } from "fs";
import { parse } from "path";

interface IDBProcessor {
    private_key: string
}

export default class DBProcessor {
    public connection: any;
    protected schemas: any[];
    protected options: IDBProcessor;

    constructor(options: any) {
        this.schemas = [];
        this.options = options;
        return this;
    }

    public async importSchema(filename: string){
        const { "default": schema } = await import(filename);
        this.schemas.push(schema);
    }

    public async importSchemas(path: string){
        const schemas = await promises.readdir(path);
        await Promise.all(schemas.map(async (schema) => {
            const schemaPath = `${path}\\${schema}`;
            const schemaStat = await promises.stat(schemaPath);

            if(schemaStat.isDirectory()) await this.importSchemas(schemaPath);
            if(parse(schemaPath).ext === ".js") await this.importSchema(schemaPath);
        }));
    }

    public async createConnection(){
        this.connection = await Realm.open({ schema: this.schemas });
    }

    public createToken(data: any) {
        return jwt.sign(data, this.options.private_key);
    }

    public isValidToken(token: string) {
        return !!jwt.verify(token, this.options.private_key);
    }

    public static decodeToken(token: string) {
        return jwt.decode(token);
    }
}