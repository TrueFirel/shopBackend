import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/User/UserController";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    this.post("/user", UserController.registerUser);
    this.put("/user/:id", UserController.updateUser);
    this.get("/user/:id", UserController.getUser);
}
