import BaseResource from "./BaseResource";
import ShopResource from "./ShopResource";

export default class ProductResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            product_name: this.product_name,
            event_name: this.event_name,
            web_site: this.web_site,
            description: this.description,
            price: this.price,
            shop: new ShopResource(this.shop).uncover(),
            likes: this.likes,
            dislikes: this.dislikes,
            create_time: this.create_time,
            photo: this.photo,
        };
    }
}
