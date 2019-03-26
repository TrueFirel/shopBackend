import BaseCollectionResource from "./BaseCollectionResource";
import ProductPhotoResource from "./ProductPhotoResource";

export default class ProductCollectionResource extends BaseCollectionResource {

    protected innerResource = ProductPhotoResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
