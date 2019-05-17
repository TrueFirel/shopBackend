import BaseCollectionResource from "./BaseCollectionResource";
import ShopResource from "./ShopProductsResource";

export default class ShopProductsCollectionResource extends BaseCollectionResource {

    protected innerResource = ShopResource;

    public uncover() {
        return this.uncoverItems().reduce((acc: any, val: any) => acc.concat(val), []);
    }
}
