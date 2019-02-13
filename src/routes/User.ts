import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/UserController";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    // @ts-ignore
    this.post("/user", UserController.registerUser);
}
