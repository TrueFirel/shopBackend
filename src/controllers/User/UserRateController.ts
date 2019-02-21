import httpError from "http-errors";
import Joi from "joi";
import DBProcessor from "../../app/DBProcessor";
import UserFavoriteCollectionResource from "../../resources/UserFavoriteCollectionResource";
import RealmListConverter from "../../util/RealmListConverter";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class UserRateController {

        public static RateValidationSchema = {
          product_id: Joi.string().required(),
          is_favorite: Joi.bool().required().allow(null),
        };

        public static async postRate(req: any, res: any, next: any) {
            try {
                const { id: userId } = req.params;
                const {
                    product_id: productId,
                    is_favorite: isFavorite,
                } = Validator(req.body, UserRateController.RateValidationSchema);

                const catalogProduct = connection.objects("product").filtered(`id = "${productId}"`)[0];
                if (!catalogProduct) throw new httpError.NotFound({message: "product with such id was not found"} as any);
                const user = connection.objects("user").filtered(`id = "${userId}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);
                const product = user.favorite_products.find(({ product }: any) => product.id === productId);
                await connection.write(() => {
                    try {
                        if (!product) {
                            if (isFavorite !== null) {
                                const favorite = connection.create("favorite", {
                                    user_id: userId,
                                    product: catalogProduct,
                                    is_favorite: isFavorite,
                                });
                                user.favorite_products.push(favorite);
                            }
                            if (isFavorite) catalogProduct.likes += 1;
                            if (isFavorite === false) catalogProduct.dislikes += 1;
                        } else {
                            if (isFavorite === null) {
                                if (product.is_favorite) catalogProduct.likes -= 1;
                                else catalogProduct.dislikes -= 1;
                                const favoriteProduct = connection.objects("favorite")
                                    .find((favorite: any) => favorite.product.id === product.product.id);
                                connection.delete(favoriteProduct);
                            } else {
                                if (product.is_favorite && isFavorite === false) {
                                    catalogProduct.likes -= 1;
                                    catalogProduct.dislikes += 1;
                                }
                                if (product.is_favorite === false && isFavorite === true) {
                                    catalogProduct.likes += 1;
                                    catalogProduct.dislikes -= 1;
                                }
                                product.is_favorite = isFavorite;
                            }
                        }
                        res.send({ message: "successful" });
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({message: "server error"} as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static getUserRates(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const { offset, limit, sort, order, filter, filter_value } = req.query;

                const user = connection.objects("user").filtered(`id = "${id}"`)[0];
                if (!user) throw new httpError.BadRequest({ message: "user with such id was not found" } as any);
                const favorites = new RealmListConverter(user.favorite_products);

                ////////// MOVE TO SEPARATE CLASS

                if  (filter_value && filter === "price") {
                    favorites.data = favorites.data.filter((favorite: any) => favorite.product[filter] <= parseInt(filter_value, 10));
                }

                if  (filter_value && filter === "event_name") {
                    favorites.data = favorites.data.filter((favorite: any) => favorite.product[filter] === filter_value);
                }
                if (sort && (sort === "likes" || sort === "create_time" || sort === "reviews")) {
                    let comparatorAsc;
                    let comparatorDesc;
                    if (sort === "reviews") {
                        comparatorAsc = (a: any, b: any) => {
                            return a.product.reviews.length - b.product.reviews.length;
                        };
                        comparatorDesc = (a: any, b: any) => {
                            return b.product.reviews.length - a.product.reviews.length;
                        };
                    } else if (sort === "create_time") {
                        comparatorAsc = (a: any, b: any) => {
                            a = new Date(a.product.create_time);
                            b = new Date(b.product.create_time);
                            return  a > b ? -1 : a < b ? 1 : 0;
                        };
                        comparatorDesc = (a: any, b: any) => {
                            a = new Date(a.product.create_time);
                            b = new Date(b.product.create_time);
                            return  a < b ? -1 : a > b ? 1 : 0;
                        };
                    } else {
                        comparatorAsc = (a: any, b: any) => {
                            return a.product.likes - b.product.likes;
                        };
                        comparatorDesc = (a: any, b: any) => {
                            return b.product.likes - a.product.likes;
                        };
                    }
                    if (order === "desc") favorites.data = favorites.data.sort(comparatorDesc);
                    else favorites.data = favorites.data.sort(comparatorAsc);
                }

                next(new UserFavoriteCollectionResource(favorites.data, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
