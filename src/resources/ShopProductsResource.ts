import BaseResource from "./BaseResource";
import ProductPhotoCollectionResource from "./ProductPhotoCollectionResource";
import ShopResource from "./ShopResource";

export default class ShopProductsResource extends BaseResource {

    public uncover() {
        return this.products.map((p: any) => ({
            id: p.id,
            product_name: p.product_name,
            event_name: p.event_name,
            web_site: p.web_site,
            description: p.description,
            price: p.price,
            shop: new ShopResource(p.shop).uncover(),
            likes: p.likes,
            dislikes: p.dislikes,
            create_time: p.create_time,
            photo: (new ProductPhotoCollectionResource(p.photo, {})).uncover().data,
        }));
    }
}
