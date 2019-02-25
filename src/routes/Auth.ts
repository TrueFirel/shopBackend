import Config from "../app/Config";
import DBProcessor from "../app/DBProcessor";
import MessageClient from "../app/MessageClient";
import UserControllerWrapper from "../controllers/User/UserController";
import AWSConnector from "../util/AWSConnector";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, config: Config) {

    const UserController = UserControllerWrapper(dbProcessor, messageClient, new AWSConnector(config));
    this.post("/login", UserController.loginAccount);
}
