import BaseCollectionResource from "./BaseCollectionResource";
import ShopResource from "./ShopResource";

export default class ShopCollectionResource extends BaseCollectionResource {

    protected innerResource = ShopResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
