import httpError from "http-errors";
import Joi from "joi";
import DBProcessor from "../../app/DBProcessor";
import ReviewCollectionResource from "../../resources/ReviewCollectionResource";
import Validator from "../../util/Validator";

export default function(dbProcessor: DBProcessor) {

    const { connection } = dbProcessor;

    return class UserReviewController {

        public static PostReviewValidationSchema = {
            product_id: Joi.string().required(),
            review: Joi.string().required(),
        };

        public static async PostReview(req: any, res: any, next: any) {
            try {
                const {
                    product_id: productId,
                    review: reviewText,
                } = Validator(req.body, UserReviewController.PostReviewValidationSchema);

                const { id: userId } = req.params;

                const user = connection.objects("user").filtered(`id = "${userId}"`)[0];
                if (!user) throw new httpError.NotFound({message: "user with such id was not found"} as any);

                const product = connection.objects("product").filtered(`id = "${productId}"`)[0];
                if (!product) throw new httpError.NotFound({message: "product with such id was not found"} as any);

                const review = user.reviews.find((review: any) => review.product_id === productId);
                await connection.write(() => {
                    try {
                        if (review) review.review = reviewText;
                        else {
                            const newReview = connection
                                .create("review", { user_id: userId, product_id: productId, review: reviewText });
                            user.reviews.push(newReview);
                        }
                        res.send({ message: "success" });
                    } catch (err) {
                        throw new httpError.ServiceUnavailable({ message: "server error" } as any);
                    }
                });
            } catch (err) {
                next(err);
            }
        }

        public static getReviews(req: any, res: any, next: any) {
            try {
                const { id } = req.params;
                const { offset, limit } = req.query;

                const reviews = connection.objects("review").filtered(`product_id = "${id}"`);
                if (!reviews.length) throw new httpError.NotFound({message: "reviews of product with such id was not found"} as any);

                next(new ReviewCollectionResource(reviews, { offset, limit }));
            } catch (err) {
                next(err);
            }
        }
    };
}
