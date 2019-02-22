import BaseCollectionResource from "./BaseCollectionResource";
import UserFavoriteResource from "./UserFavoriteResource";

export default class UserFavoriteCollectionResource extends BaseCollectionResource {

    protected innerResource = UserFavoriteResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
