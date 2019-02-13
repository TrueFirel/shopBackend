import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/User/UserController";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    // @ts-ignore
    this.post("/login", UserController.loginUser);
}
