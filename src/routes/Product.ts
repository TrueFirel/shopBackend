import Config from "../app/Config";
import DBProcessor from "../app/DBProcessor";
import MessageClient from "../app/MessageClient";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import UserReviewControllerWrapper from "../controllers/User/UserReviewController";
import CheckAuth from "../middleware/CheckAuth";
import AWSConnector from "../util/AWSConnector";

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, config: Config) {

    const checkAuth = CheckAuth(dbProcessor);
    const awsConnector = new AWSConnector(config);
    const ProductController = ProductControllerWrapper(dbProcessor, awsConnector);
    const UserReviewController = UserReviewControllerWrapper(dbProcessor);

    this.get("/product", checkAuth.isAnyAuth, ProductController.getProducts);
    this.get("/product/latest", checkAuth.isAnyAuth, ProductController.getLatestProducts);
    this.get("/product/:id", checkAuth.isAnyAuth, ProductController.getProduct);
    this.get("/product/:id/review", checkAuth.isAnyAuth, UserReviewController.getReviews);
    this.delete("/product/:product_id/photo/:id", checkAuth.isShopAuth, ProductController.deleteProductPhoto);
    this.delete("/product/:product_id/", checkAuth.isShopAuth, ProductController.deleteProduct);
}
