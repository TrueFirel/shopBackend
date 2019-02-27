import Aws from "aws-sdk";
import bluebird from "bluebird";
import httpError from "http-errors";

export default class AWSConnector {
    public s3: any;
    public uploader: any;

    constructor(config: any) {
        Aws.config.update({
            secretAccessKey: config.env.AWS_SECRET_ACCESS_KEY,
            accessKeyId: config.env.AWS_ACCESS_KEY_ID,
            region: config.env.REGION,
        });
        Aws.config.setPromisesDependency(bluebird);

        this.s3 = new Aws.S3();
    }

    public async updateFile(image: any) {
        const bucket = process.env.S3_BUCKET;
        const mimetype = image.mimetype.split("/")[1];

        if (mimetype !== "png" && mimetype !== "jpg" && mimetype !== "tif") {
            throw new httpError.BadRequest({ message: "incorrect image format" } as any);
        }

        return this.s3.upload({
            ACL: "public-read",
            Body: image.buffer,
            Bucket: process.env.S3_BUCKET,
            Key: `${bucket}/${Date.now().toString()}.${mimetype}`,
        }).promise();
    }
}
