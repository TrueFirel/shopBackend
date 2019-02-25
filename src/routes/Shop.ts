import multer from "multer";
import Config from "../app/Config";
import DBProcessor from "../app/DBProcessor";
import MessageClient from "../app/MessageClient";
import ProductControllerWrapper from "../controllers/Product/ProductController";
import ShopControllerWrapper from "../controllers/Shop/ShopController";
import CheckAuth from "../middleware/CheckAuth";
import AWSConnector from "../util/AWSConnector";
const upload = multer();

export default function(dbProcessor: DBProcessor, messageClient: MessageClient, config: Config) {

    const checkAuth = CheckAuth(dbProcessor);
    const ShopController = ShopControllerWrapper(dbProcessor, messageClient, new AWSConnector(config));
    const ProductController = ProductControllerWrapper(dbProcessor);

    this.get("/shop/:id", checkAuth.isAnyAuth, ShopController.getShop);
    this.get("/shop", checkAuth.isAnyAuth, ShopController.getShops);
    this.get("/shop/:id/product", checkAuth.isAnyAuth, ProductController.getProducts);
    this.post("/shop", upload.single("photo"), ShopController.registerShop);
    this.post("/shop/:id/product", checkAuth.isShopAuth, ProductController.AddProduct);
    this.put("/shop/:id", checkAuth.isShopAuth, upload.single("photo"), ShopController.updateShop);
    this.put("/shop/:id/verify", ShopController.verifyPhoneNumber);
    this.put("/shop/:shopId/product/:id", checkAuth.isShopAuth, ProductController.updateProduct);
}
