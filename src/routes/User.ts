import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/User/UserController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    const checkAuth = CheckAuth(dbProcessor);

    this.use("/user", checkAuth.isUserAuth);

    this.post("/user", UserController.registerUser);
    this.put("/user/:id", UserController.updateUser);
    this.get("/user/:id", UserController.getUser);
}
