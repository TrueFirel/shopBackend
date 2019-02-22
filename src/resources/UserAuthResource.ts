import BaseResource from "./BaseResource";

export default class UserAuthResource extends BaseResource {

    public uncover() {
        return {
            id: this.id,
            name: this.name,
            username: this.username,
            token: this.token,
            phone_number: this.phone_number,
            photo: this.photo,
            create_time: this.create_time,
        };
    }
}
