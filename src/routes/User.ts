import multer from "multer";
import Config from "../app/Config";
import DBProcessor from "../app/DBProcessor";
import MessageClient from "../app/MessageClient";
import UserControllerWrapper from "../controllers/User/UserController";
import UserRateControllerWrapper from "../controllers/User/UserRateController";
import UserRevewControllerWrapper from "../controllers/User/UserReviewController";
import CheckAuth from "../middleware/CheckAuth";
import AWSConnector from "../util/AWSConnector";
const upload = multer();

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, config: Config) {

    const UserController = UserControllerWrapper(dbProcessor, messageClient, new AWSConnector(config));
    const UserReviewController = UserRevewControllerWrapper(dbProcessor);
    const checkAuth = CheckAuth(dbProcessor);
    const userRateController = UserRateControllerWrapper(dbProcessor);

    this.get("/user", checkAuth.isAnyAuth, UserController.getUsers);
    this.get("/user/:id", checkAuth.isAnyAuth, UserController.getUser);
    this.get("/user/:id/favorite", checkAuth.isAnyAuth, userRateController.getUserRates);
    this.post("/user", upload.single("photo"), UserController.registerUser);
    this.post("/user/:id/rate", checkAuth.isUserAuth, userRateController.postRate);
    this.post("/user/:id/review", checkAuth.isUserAuth, UserReviewController.PostReview);
    this.put("/user/:id", checkAuth.isUserAuth, upload.single("photo"), UserController.updateUser);
    this.put("/user/:id/verify", UserController.verifyPhoneNumber);
}
