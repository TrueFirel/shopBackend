import BaseResource from "./BaseResource";

export default class ReviewResource extends BaseResource {

    public uncover() {
        return {
            user_id: this.user_id,
            product_id: this.product_id,
            review: this.review,
        };
    }
}
