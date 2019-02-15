import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import ShopControllerWrapper from "../controllers/Shop/ShopController";
import CheckAuth from "../middleware/CheckAuth";

export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const ShopController = ShopControllerWrapper(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);

    this.get("/shop/:id", checkAuth.isShopAuth, ShopController.getShop);
    this.get("/shop", checkAuth.isAnyAuth, ShopController.getShops);
    this.post("/shop", ShopController.registerShop);
    this.post("/shop/:id/product", checkAuth.isShopAuth, ProductController.AddProduct);
    this.put("/shop/:id", checkAuth.isShopAuth, ShopController.updateShop);
    this.put("/shop/:shopId/product/:id", checkAuth.isShopAuth, ProductController.updateProduct);
}
