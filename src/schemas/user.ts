export default {
    name: "user",
    properties: {
        id: "string",
        token: {
            type: "string",
            optional: true,
        },
        verification_code: {
            type: "string",
            optional: true,
        },
        username: "string",
        name: "string",
        password: "string",
        create_time: "date",
        phone_number: "string",
        favorite_products: "favorite[]",
        subscribed_shops: "shop[]",
        reviews: "review[]",
        photo: {
            type: "string",
            optional: true,
        },
    },
};
