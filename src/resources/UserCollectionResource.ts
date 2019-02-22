import BaseCollectionResource from "./BaseCollectionResource";
import UserResource from "./UserResource";

export default class UserCollectionResource extends BaseCollectionResource {

    protected innerResource = UserResource;

    public uncover() {
        return {
            offset: this.options.offset,
            limit: this.options.limit,
            data: this.uncoverItems(),
        };
    }
}
