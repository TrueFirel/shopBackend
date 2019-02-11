import httpError from "http-errors";
import UserControllerWrapper from "../controllers/UserController";

export default function (dbConnection: any) {

    const UserController = UserControllerWrapper(dbConnection);
    // @ts-ignore
    this.post("/user", UserController.registerUser);
}
