import BaseResource from "./BaseResource";

export default class ProductResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            product_name: this.product_name,
            event_name: this.event_name,
            web_site: this.web_site,
            description: this.description,
            price: this.price,
            shop_id: this.shop_id,
            likes: this.likes,
            dislikes: this.dislikes,
        };
    }
}
