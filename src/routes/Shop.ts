import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import ShopControllerWrapper from "../controllers/Shop/ShopController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const UserController = ShopControllerWrapper(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);

    this.post("/shop", UserController.registerShop);
    this.get("/shop/:id", checkAuth.isShopAuth, UserController.getShop);
    this.put("/shop/:id", checkAuth.isShopAuth, UserController.updateShop);

    this.post("/shop/:id/product", checkAuth.isShopAuth, ProductController.AddProduct);
    this.put("/shop/:shopId/product/:id", checkAuth.isShopAuth, ProductController.updateProduct);
}
