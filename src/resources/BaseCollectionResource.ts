import BaseResource from "./BaseResource";

export default class BaseCollectionResource extends BaseResource {

    protected innerResource: any = BaseResource;

    public uncoverItems() {
        const { offset, limit } = this.options;
        let resourcedData = this.data.map((item: any) => new this.innerResource(item).uncover());

        if (offset && limit) resourcedData = resourcedData.slice(offset).slice(0, limit);
        else if (offset) resourcedData = resourcedData.slice(offset);
        else if (limit) resourcedData = resourcedData.slice(0, limit);

        return resourcedData;
    }

    public uncover() {
        return {
            data: this.uncoverItems(),
        };
    }
}
