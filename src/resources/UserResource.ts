import BaseResource from "./BaseResource";

export default class UserResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            name: this.name,
            username: this.username,
            phone_number: this.phone_number,
            photo: this.photo,
            create_time: this.create_time,
        };
    }
}
