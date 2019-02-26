export default {
    name: "shop",
    properties: {
        company_name: {
            type: "string",
            optional: true,
        },
        address: {
            type: "string",
            optional: true,
        },
        token: {
            type: "string",
            optional: true,
        },
        verification_code: {
            type: "string",
            optional: true,
        },
        password: {
            type: "string",
            optional: true,
        },
        create_time: "date",
        phone_number: "string",
        products: "product[]",
        photo: {
            type: "string",
            optional: true,
        },
        id: "string",
        web_site: {
            type: "string",
            optional: true,
        },
    },
};
