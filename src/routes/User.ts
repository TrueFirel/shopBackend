import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/User/UserController";
import UserRateControllerWrapper from "../controllers/User/UserRateController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    const checkAuth = CheckAuth(dbProcessor);
    const userRateController = UserRateControllerWrapper(dbProcessor);

    this.use("/user", checkAuth.isUserAuth);

    this.post("/user", UserController.registerUser);
    this.put("/user/:id", UserController.updateUser);
    this.get("/user/:id", UserController.getUser);

    this.post("/user/:id/rate", userRateController.postRate);
    this.get("/user/:id/favorite", userRateController.getUserRates);
}
