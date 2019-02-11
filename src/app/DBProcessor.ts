import Realm from "realm";
import { promises } from "fs";
import { parse } from "path";

export default class DBProcessor {
    public connection: any;
    protected schemas: any[];
    protected options: any;

    constructor() {
        this.schemas = [];
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

}