import DBProcessor from "../app/DBProcessor";
import UserControllerWrapper from "../controllers/User/UserController";
import UserRateControllerWrapper from "../controllers/User/UserRateController";
import UserRevewControllerWrapper from "../controllers/User/UserReviewController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const UserController = UserControllerWrapper(dbProcessor);
    const UserReviewController = UserRevewControllerWrapper(dbProcessor);
    const checkAuth = CheckAuth(dbProcessor);
    const userRateController = UserRateControllerWrapper(dbProcessor);

    this.get("/user", checkAuth.isAnyAuth, UserController.getUsers);
    this.get("/user/:id", checkAuth.isAnyAuth, UserController.getUser);
    this.get("/user/:id/favorite", checkAuth.isAnyAuth, userRateController.getUserRates);
    this.post("/user", UserController.registerUser);
    this.post("/user/:id/rate", checkAuth.isUserAuth, userRateController.postRate);
    this.post("/user/:id/review", checkAuth.isUserAuth, UserReviewController.PostReview);
    this.put("/user/:id", checkAuth.isUserAuth, UserController.updateUser);
}
