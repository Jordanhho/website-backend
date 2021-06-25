const AWS = require('aws-sdk');
const multer = require('multer');
const storage = multer.memoryStorage();
const moment = require("moment");

const {
    awsS3DebugMsges
} = require("../config/debug");

const PRIVATE_BUCKET = process.env.PRIVATE_BUCKET;

const s3Config = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4'
};

const DEFAULT_S3_URL_EXPIRE_SECONDS = 3600; //default 1 hour

const s3 = new AWS.S3(s3Config);

const upload = multer({ storage: storage });

//note file is buffer
async function uploadToS3(key, buffer, mimetype) {
    return new Promise((resolve, reject) => {
        s3.putObject(
            {
                Bucket: PRIVATE_BUCKET,
                ContentType: mimetype,
                Key: key,
                Body: buffer
            },
            (err, data) => {
                if(err) {
                    reject(err);
                }
                resolve(data);
            }
        );
    });
}

async function getS3SignedUrl(key, expires = DEFAULT_S3_URL_EXPIRE_SECONDS) {
    return new Promise((resolve, reject) => {
        s3.getSignedUrl(
            "getObject",
            {
                Bucket: PRIVATE_BUCKET,
                Key: key,
                Expires: expires
            },
            function (err, url) {
                if (err) {
                    throw new Error(err);
                }
                resolve(url);
            }
        );
    });
}


//returns the signed url object with expire_at time and the url
//returns null if failure
async function getS3UrlBucketFile(bucketObject) {
    //get signed url to store in db with its expiry
    const expire_at = moment().add(DEFAULT_S3_URL_EXPIRE_SECONDS, 'seconds').toISOString();
    const s3_url = await getS3SignedUrl(bucketObject.bucket_key);

    if(!s3_url) {
        return null;
    }
    return {
        bucket_key: bucketObject.bucket_key,
        expire_at: expire_at,
        bucket_file_signed_url: s3_url,
        file_id: bucketObject.file_id,
        is_private: bucketObject.is_private
    }
}

//given a bucket name item, return the signed url and if its expired, request the object again.
//if it hasn't expired, return null 
async function getRenewedS3UrlBucketFile(bucketObject) {
    if(!bucketObject) {
        return null;
    }

    //check if signed url has expired, otherwise just return the url
    if (moment().isAfter(bucketObject.expire_at)) {
        awsS3DebugMsges("Refreshed S3 Bucket File: ", bucketObject)
        return await getS3UrlBucketFile(bucketObject);
    }
    return null;
}

module.exports = {
    getS3SignedUrl,
    getS3UrlBucketFile,
    getRenewedS3UrlBucketFile,
    uploadToS3,
    upload,
}