import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import UserReviewControllerWrapper from "../controllers/User/UserReviewController";
import CheckAuth from "../middleware/CheckAuth";
import AWSConnector from "../util/AWSConnector";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const awsConnector = new AWSConnector({});
    const ProductController = ProductControllerWrapper(dbProcessor, awsConnector);
    const UserReviewController = UserReviewControllerWrapper(dbProcessor);

    this.get("/product/:id", checkAuth.isAnyAuth, ProductController.getProduct);
    this.get("/product", checkAuth.isAnyAuth, ProductController.getProducts);
    this.get("/product/:id/review", checkAuth.isAnyAuth, UserReviewController.getReviews);
}
