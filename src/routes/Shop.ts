import DBProcessor from "../app/DBProcessor";
import ShopControllerWrapper from "../controllers/Shop/ShopController";

export default function(dbProcessor: DBProcessor) {

    const UserController = ShopControllerWrapper(dbProcessor);
    this.post("/shop", UserController.registerShop);
    this.put("/shop/:id", UserController.updateShop);
}
