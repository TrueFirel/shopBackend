import checkAuthWrapper from "../middleware/CheckAuth";
import DBProcessor from "../app/DBProcessor";

export default function (dbProcessor: DBProcessor) {
    const checkAuth = checkAuthWrapper(dbProcessor);
    // @ts-ignore
    this.use("", checkAuth.isAuth);
}
