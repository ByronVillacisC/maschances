// src/config/storage.js
const { S3Client } = require('@aws-sdk/client-s3');

let s3Client;

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
      },
      forcePathStyle: !!process.env.S3_ENDPOINT // requerido para R2/MinIO
    });
  }
  return s3Client;
}

module.exports = { getS3Client };