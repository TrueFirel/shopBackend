import checkAuthWrapper from "../middleware/CheckAuth";

export default function (dbConnection: any) {
    const checkAuth = checkAuthWrapper(dbConnection);
    // @ts-ignore
    this.use("", checkAuth.isAuth);
}
