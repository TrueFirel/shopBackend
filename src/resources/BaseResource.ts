export default class BaseResource {
    [key: string]: any;
    protected data: any;

    constructor(data: any){
        this.data = data;
        return new Proxy(this, {
            get(target: any, key: string) {
                if(key in target) return target[key];

                return target.data[key];
            }
        })
    }

    public uncover() {
        return this.data;
    }
}