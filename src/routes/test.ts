import httpError from "http-errors";
import DBProcessor from "../app/DBProcessor";

export default function (dbProcessor: DBProcessor) {
    // @ts-ignore
    this.get("/test", (req, res, next) => {
        try{
            throw new httpError.BadRequest("Any http error");
        } catch(err) {
            next(err);
        }
    });
}
