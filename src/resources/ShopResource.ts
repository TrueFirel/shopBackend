import BaseResource from "./BaseResource";

export default class UserResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            company_name: this.company_name,
            phone_number: this.phone_number,
            photo: this.photo,
            web_site: this.web_site,
            address: this.address,
            create_time: this.create_time,
        };
    }
}
