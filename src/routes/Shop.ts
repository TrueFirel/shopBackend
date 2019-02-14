import DBProcessor from "../app/DBProcessor";
import ShopControllerWrapper from "../controllers/Shop/ShopController";
import CheckAuth from "../middleware/CheckAuth";
import ProductControllerWrapper from "../controllers/Product/ProductController";


export default function(dbProcessor: DBProcessor) {

    const checkAuth = CheckAuth(dbProcessor);
    const UserController = ShopControllerWrapper(dbProcessor);
    const ProductController = ProductControllerWrapper(dbProcessor);

    this.use("/shop", checkAuth.isShopAuth);

    this.post("/shop", UserController.registerShop);
    this.get("/shop/:id", UserController.getShop);
    this.put("/shop/:id", UserController.updateShop);

    this.post("/shop/:id/product", ProductController.AddProduct);
}
