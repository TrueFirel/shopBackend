import BaseResource from "./BaseResource";

export default class ProductPhotoResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            product_id: this.product_id,
            photo: this.photo,
        };
    }
}
