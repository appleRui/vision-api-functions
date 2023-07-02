'use strict';

const Vision = require('@google-cloud/vision');
const vision = new Vision.ImageAnnotatorClient();

const functions = require('@google-cloud/functions-framework');

/**
 * CloudVisionAPIを使って画像からテキストを抽出する
 */
const detectText = async (bucketName, fileName) => {
  console.log(`Looking for text in image ${fileName}`);
  const [result] = await vision.textDetection(`gs://${bucketName}/${fileName}`).catch(err => {
    console.error('ERROR:', JSON.stringify(err));
  });
  const detections = result.textAnnotations;
  console.log('TEXT: ', JSON.stringify(detections[0].description.split('\n')));
};

/**
 * CloudStorageにULをトリガーに起動する関数
 */
functions.cloudEvent('processImage', async cloudEvent => {
  const {bucket, name} = cloudEvent.data;

  if (!bucket) {
    throw new Error(
      'Bucket not provided. Make sure you have a "bucket" property in your request'
    );
  }
  if (!name) {
    throw new Error(
      'Filename not provided. Make sure you have a "name" property in your request'
    );
  }

  await detectText(bucket, name);
  console.log(`File ${name} processed.`);
});