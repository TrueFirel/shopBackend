import {sha512} from "js-sha512";
import uuid from "uuid";
import DBProcessor from "../../app/DBProcessor";
import { Event } from "../../constants/Events";
import product from "../../schemas/product";
import shop from "../../schemas/shop";

export default class Faker {

    protected dbProcessor: DBProcessor;
    protected connection: any;
    protected config: any;

    constructor(dbProcessor: DBProcessor, config: any) {
        this.dbProcessor = dbProcessor;
        this.connection = dbProcessor.connection;
        this.config = config;
    }

    public async addUsers(count: number) {
        const users: any[] = [];
        await this.connection.write(() => {
            for (let i = 0; i < count; i++) {
                const filler = uuid();
                const user = this.connection.create("user", {
                    id: filler, token: this.dbProcessor.createToken(filler), username: filler, name: filler,
                    password: sha512(this.config.env.FAKE_PASSWORD.toString()), create_time: Date(), phone_number: filler,
                    photo: this.config.env.FAKE_USER_IMAGE,
                });
                users.push(user);
            }
        });
        return users;
    }

    public async addShops(count: number) {
        const shops: any[] = [];
        await this.connection.write(() => {
            for (let i = 0; i < count; i++) {
                const filler = uuid();
                const shop = this.connection.create("shop", {
                    id: filler, token: this.dbProcessor.createToken(filler), company_name: filler, address: filler,
                    password: sha512(this.config.env.FAKE_PASSWORD), create_time: Date(), phone_number: filler, web_site: filler,
                    photo: this.config.env.FAKE_SHOP_IMAGE,
                });
                shops.push(shop);
            }
        });
        return shops;
    }

    public async addProducts(shop: any, amount: number) {
        const products: any[] = [];
        await this.connection.write(() => {
            for (let i = 0; i < amount; i++) {
                const filler = uuid();
                const product = this.connection.create("product", {
                    id: filler, product_name: filler, description: filler, event_name: Event.BIRTHDAY,
                    price: 100 * i, create_time: Date(), phone_number: filler, web_site: filler, shop,
                });
                const productPhoto = this.connection.create("product_photo", {
                    id: uuid(), product_id: product.id, photo: this.config.env.FAKE_PRODUCT_IMAGE,
                });
                product.photo.push(productPhoto);
                shop.products.push(product);
                products.push(product);
            }
        });
        return products;
    }

    public async addReview(user: any, product: any) {
        let review: any;
        await this.connection.write(() => {
            review = this.connection.create("review", {
                user_id: user.id, product_id: product.id, review: uuid(),
            });
            user.reviews.push(review);
        });
        return review;
    }

    public async addFavorite(user: any, products: any[]) {
        const favorites: any[] = [];
        await this.connection.write(() => {
            for (const product of products) {
                const isFavorite = Math.round(Math.random());
                const favorite = this.connection.create("favorite", {
                    product, user_id: user.id, is_favorite: !!isFavorite,
                });
                user.favorite_products.push(favorite);
                isFavorite ? product.likes++ : product.dislikes++;
                favorites.push(favorite);
            }
        });
        return favorites;
    }

}
