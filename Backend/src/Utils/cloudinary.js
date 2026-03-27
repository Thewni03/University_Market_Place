import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

let cloudinaryModule;

const getCloudinary = async () => {
  if (cloudinaryModule) return cloudinaryModule;

  try {
    const imported = await import("cloudinary");
    const cloudinary = imported.v2 || imported.default?.v2 || imported.default;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    cloudinaryModule = cloudinary;
    return cloudinaryModule;
  } catch {
    throw new Error('Optional dependency "cloudinary" is not installed.');
  }
};

const cloudinary = {
  uploader: {
    upload: async (...args) => {
      const client = await getCloudinary();
      return client.uploader.upload(...args);
    },
  },
};

export default cloudinary;
