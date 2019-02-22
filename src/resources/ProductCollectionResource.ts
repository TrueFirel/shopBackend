import BaseCollectionResource from "./BaseCollectionResource";
import ProductResource from "./ProductResource";

export default class ProductCollectionResource extends BaseCollectionResource {

    protected innerResource = ProductResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
