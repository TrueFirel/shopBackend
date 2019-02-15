import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import ShopControllerWrapper from "../controllers/Shop/ShopController";
import UserControllerWrapper from "../controllers/User/UserController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);
    const UserController = UserControllerWrapper(dbProcessor);
    const ShopController = ShopControllerWrapper(dbProcessor);

    this.use("/", checkAuth.isAnyAuth);
    this.get("/product/:id", ProductController.getProduct);
    this.get("/product", ProductController.getProducts);
    this.get("/user", UserController.getUsers);
    this.get("/shop", ShopController.getShops);
}
