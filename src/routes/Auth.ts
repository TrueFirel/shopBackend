import DBProcessor from "../app/DBProcessor";
import MessageClient from "../app/MessageClient";
import UserControllerWrapper from "../controllers/User/UserController";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient) {

    const UserController = UserControllerWrapper(dbProcessor, messageClient);
    this.post("/login", UserController.loginAccount);
}
