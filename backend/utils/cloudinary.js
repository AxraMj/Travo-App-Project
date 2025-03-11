const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload video to Cloudinary
exports.uploadVideo = async (videoBase64) => {
  try {
    console.log('Uploading video to Cloudinary...');
    
    // Upload video to Cloudinary
    const videoUpload = await cloudinary.uploader.upload(videoBase64, {
      resource_type: 'video',
      folder: 'videos',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    console.log('Video upload successful');

    // Generate thumbnail URL
    const thumbnailUrl = videoUpload.secure_url.replace('/upload/', '/upload/w_640,h_360,c_fill,g_auto/');

    return {
      videoUrl: videoUpload.secure_url,
      thumbnailUrl,
      publicId: videoUpload.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload video to Cloudinary: ' + error.message);
  }
};

// Delete video from Cloudinary
exports.deleteVideo = async (videoUrl) => {
  try {
    // Extract public ID from URL
    const publicId = videoUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Video deletion failed');
  }
}; 