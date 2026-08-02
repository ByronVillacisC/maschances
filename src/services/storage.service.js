// src/services/storage.service.js
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getS3Client } = require('../config/storage');
const { randomUUID } = require('crypto');

const BUCKET = process.env.S3_BUCKET;
const SIGNED_URL_EXPIRES = 3600; // 1 hora

/**
 * Sube un buffer al bucket privado.
 * @param {Buffer} buffer
 * @param {string} folder - ej. 'packages/images'
 * @param {string} mimeType
 * @returns {Promise<string>} key del objeto
 */
async function uploadFile(buffer, folder, mimeType) {
  const key = `${folder}/${randomUUID()}`;
  const client = getS3Client();

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType
  }));

  return key;
}

/**
 * Elimina un objeto del bucket.
 * @param {string} key
 */
async function deleteFile(key) {
  if (!key) return;
  const client = getS3Client();
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/**
 * Genera una URL firmada con expiración.
 * @param {string} key
 * @param {number} expiresIn - segundos
 * @returns {Promise<string>}
 */
async function getSignedFileUrl(key, expiresIn = SIGNED_URL_EXPIRES) {
  if (!key) return null;
  const client = getS3Client();
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

module.exports = { uploadFile, deleteFile, getSignedFileUrl };