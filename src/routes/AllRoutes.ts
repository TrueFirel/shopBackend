import DBProcessor from "../app/DBProcessor";
import checkAuthWrapper from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {
    const checkAuth = checkAuthWrapper(dbProcessor);
    // @ts-ignore
    this.use("", checkAuth.isAuth);
}
