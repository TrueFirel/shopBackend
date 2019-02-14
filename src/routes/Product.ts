import DBProcessor from "../app/DBProcessor";
import ProductControllerWrapper from "../controllers/Product/ProductController";

export default function(dbProcessor: DBProcessor) {

    const UserController = ProductControllerWrapper(dbProcessor);
}
