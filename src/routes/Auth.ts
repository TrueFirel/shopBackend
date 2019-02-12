import UserControllerWrapper from "../controllers/UserController";
import DBProcessor from "../app/DBProcessor";

export default function (dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    // @ts-ignore
    this.get("/login", UserController.registerUser);
}
