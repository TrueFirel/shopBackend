import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);

    this.use("/product", checkAuth.isAnyAuth);
    this.get("/product/:id", ProductController.getProduct);
}
