import httpError from "http-errors";

export default function (dbConnection: any) {
    return class CheckAuth{
        public static isAuth(req: any, res: any, next: any) {
            try {
                if(req.url === "/login" || (req.url === "/user" && req.method === "POST")) {
                    next();
                }
                const authHeader = req.get("Authorization");
                if(!authHeader || authHeader.split(" ")[0].toLocaleLowerCase() !== "bearer") {
                    throw new httpError.Unauthorized("No valid token");
                }
                const token = authHeader.split(" ")[1];
                const user = dbConnection.objects("user").filtered(`token = "${token}"`);
                if(!user) {
                    throw new httpError.Unauthorized("No valid token");
                }
                req.user = user;
                next();
            } catch(err) {
                next(err);
            }
        }
    }
}