import httpError from "http-errors";
import DBProcessor from "../app/DBProcessor";

export default function(dbProcessor: DBProcessor) {
    return class CheckAuth {
        public static isUserAuth(req: any, res: any, next: any) {
            try {
                if (req.url === "/" && req.method === "POST") {
                    return next();
                }
                const authHeader = req.get("Authorization");
                if (!authHeader || authHeader.split(" ")[0].toLocaleLowerCase() !== "bearer") {
                    throw new httpError.Unauthorized("No valid token");
                }
                const token = authHeader.split(" ")[1];
                const user = dbProcessor.connection.objects("user").filtered(`token = "${token}"`);
                if (!user[0]) {
                    throw new httpError.Unauthorized("No valid token");
                }
                if (user[0]) req.user = user[0];
                next();
            } catch (err) {
                next(err);
            }
        }

        public static isShopAuth(req: any, res: any, next: any) {
            try {
                if (req.url === "/" && req.method === "POST") {
                    return next();
                }
                const authHeader = req.get("Authorization");
                if (!authHeader || authHeader.split(" ")[0].toLocaleLowerCase() !== "bearer") {
                    throw new httpError.Unauthorized("No valid token");
                }
                const token = authHeader.split(" ")[1];
                const shop = dbProcessor.connection.objects("shop").filtered(`token = "${token}"`);
                if (!shop[0]) {
                    throw new httpError.Unauthorized("No valid token");
                }
                if (shop[0]) req.shop = shop[0];
                next();
            } catch (err) {
                next(err);
            }
        }

        public static isAnyAuth(req: any, res: any, next: any) {
            try {
                const authHeader = req.get("Authorization");
                if (!authHeader || authHeader.split(" ")[0].toLocaleLowerCase() !== "bearer") {
                    throw new httpError.Unauthorized("No valid token");
                }
                const token = authHeader.split(" ")[1];
                const user = dbProcessor.connection.objects("user").filtered(`token = "${token}"`)[0];
                const shop = dbProcessor.connection.objects("shop").filtered(`token = "${token}"`)[0];
                if (!shop && !user) {
                    throw new httpError.Unauthorized("No valid token");
                }
                if (shop) req.shop = shop;
                if (user) req.user = user;
                next();
            } catch (err) {
                next(err);
            }
        }

    };
}
