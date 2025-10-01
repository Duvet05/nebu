import { registerAs } from '@nestjs/config';

export default registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  secure: process.env.NODE_ENV === 'production',

  // Upload presets for different media types
  presets: {
    courses: process.env.CLOUDINARY_PRESET_COURSES || 'nebu_courses',
    videos: process.env.CLOUDINARY_PRESET_VIDEOS || 'nebu_videos',
    thumbnails: process.env.CLOUDINARY_PRESET_THUMBNAILS || 'nebu_thumbnails',
    materials: process.env.CLOUDINARY_PRESET_MATERIALS || 'nebu_materials',
    avatars: process.env.CLOUDINARY_PRESET_AVATARS || 'nebu_avatars',
    certificates: process.env.CLOUDINARY_PRESET_CERTIFICATES || 'nebu_certificates',
  },

  // Folder structure
  folders: {
    courses: 'nebu-academy/courses',
    videos: 'nebu-academy/videos',
    thumbnails: 'nebu-academy/thumbnails',
    materials: 'nebu-academy/materials',
    avatars: 'nebu-academy/avatars',
    certificates: 'nebu-academy/certificates',
  },

  // Transformation settings
  transformations: {
    thumbnail: {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
    courseImage: {
      width: 800,
      height: 450,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
    avatar: {
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto',
    },
    videoThumbnail: {
      width: 640,
      height: 360,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
  },
}));
