import httpError from "http-errors";
import DBProcessor from "../app/DBProcessor";

export default function(dbProcessor: DBProcessor) {
    return class CheckAuth {
        public static isAuth(req: any, res: any, next: any) {
            try {
                if (req.url === "/login" || (req.url === "/user" && req.method === "POST")
                    || (req.url === "/shop" && req.method === "POST")) {
                    return next();
                }
                const authHeader = req.get("Authorization");
                if (!authHeader || authHeader.split(" ")[0].toLocaleLowerCase() !== "bearer") {
                    throw new httpError.Unauthorized("No valid token");
                }
                const token = authHeader.split(" ")[1];
                const user = dbProcessor.connection.objects("user").filtered(`token = "${token}"`);
                const shop = dbProcessor.connection.objects("shop").filtered(`token = "${token}"`);
                if (!user[0] && !shop[0]) {
                    throw new httpError.Unauthorized("No valid token");
                }
                if (user[0]) req.user = user[0];
                if (shop[0]) req.shop = shop[0];
                next();
            } catch (err) {
                next(err);
            }
        }

    };
}
