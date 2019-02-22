export default {
    name: "shop",
    properties: {
        company_name: "string",
        address: "string",
        token: {
            type: "string",
            optional: true,
        },
        verification_code: {
            type: "string",
            optional: true,
        },
        password: "string",
        create_time: "date",
        contact_number: "string",
        products: "product[]",
        photo: {
            type: "string",
            optional: true,
        },
        id: "string",
        web_site: "string",
    },
};
