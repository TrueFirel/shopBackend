interface IResourceOptions {
    offset?: number;
    limit?: number;
}

export default class BaseResource {
    [key: string]: any;
    protected data: any;
    protected options: IResourceOptions;

    constructor(data: any, options?: any) {
        this.data = data;
        this.options = options;
        return new Proxy(this, {
            get(target: any, key: string) {
                if (key in target) return target[key];
                return target.data[key];
            },
        });
    }

    public uncover() {
        return this.data;
    }
}
