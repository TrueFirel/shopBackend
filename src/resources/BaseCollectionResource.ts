import BaseResource from "./BaseResource";

export default class BaseCollectionResource extends BaseResource {

    protected innerResource: any = BaseResource;

    public uncoverItems() {
        return this.data.map((item: any) => new this.innerResource(item).uncover());
    }

    public uncover() {
        return {
            data: this.uncoverItems(),
        };
    }

}
