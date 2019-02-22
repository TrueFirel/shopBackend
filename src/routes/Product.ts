import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import UserReviewControllerWrapper from "../controllers/User/UserReviewController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);
    const UserReviewController = UserReviewControllerWrapper(dbProcessor);

    this.get("/product/:id", checkAuth.isAnyAuth, ProductController.getProduct);
    this.get("/product", checkAuth.isAnyAuth, ProductController.getProducts);
    this.get("/product/:id/review", checkAuth.isAnyAuth, UserReviewController.getReviews);
}
