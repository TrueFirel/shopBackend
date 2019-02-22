import BaseCollectionResource from "./BaseCollectionResource";
import ReviewResource from "./ReviewResource";

export default class ReviewCollectionResource extends BaseCollectionResource {

    protected innerResource = ReviewResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
