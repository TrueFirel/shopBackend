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
        username: {
            type: "string",
            optional: true,
        },
        name: {
            type: "string",
            optional: true,
        },
        password: {
            type: "string",
            optional: true,
        },
        create_time: "date",
        phone_number: "string",
        favorite_products: "favorite[]",
        reviews: "review[]",
        photo: {
            type: "string",
            optional: true,
        },
    },
};
