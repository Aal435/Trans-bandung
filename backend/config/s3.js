const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-2'
});

const s3 = new AWS.S3();
let cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;

// Remove https:// or http:// from CloudFront domain if present
if (cloudFrontDomain) {
  cloudFrontDomain = cloudFrontDomain.replace(/^https?:\/\//, '');
  console.log('✓ CloudFront domain configured:', cloudFrontDomain);
}

// Function to upload file to S3
const uploadToS3 = async (fileBuffer, fileName, folder = 'uploads') => {
  // Determine Content-Type based on file extension
  const ext = fileName.toLowerCase().split('.').pop();
  const contentTypeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  const contentType = contentTypeMap[ext] || 'application/octet-stream';

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `${folder}/${Date.now()}-${fileName}`,
    Body: fileBuffer,
    ContentType: contentType
  };

  try {
    const result = await s3.upload(params).promise();
    
    // Use CloudFront URL if configured, otherwise fall back to S3 URL
    let url;
    if (cloudFrontDomain) {
      url = `https://${cloudFrontDomain}/${result.Key}`;
    } else {
      url = result.Location;
    }
    
    return {
      success: true,
      url: url,
      key: result.Key
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to delete file from S3
const deleteFromS3 = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileKey
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3
};
