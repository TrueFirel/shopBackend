import BaseResource from "./BaseResource";
import ProductReource from "./ProductResource";

export default class ProductResource extends BaseResource {

    public uncover() {
        return {
            product: new ProductReource(this.product).uncover(),
            user_id: this.user_id,
            is_favorite: this.is_favorite,
        };
    }
}
