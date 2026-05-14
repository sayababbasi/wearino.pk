import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const clean = (val) => val ? val.toString().trim().replace(/[\r\n\t]/g, '') : '';

const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = clean(process.env.CLOUDINARY_API_KEY);
const apiSecret = clean(process.env.CLOUDINARY_API_SECRET);

console.log("--- CLOUDINARY CONNECTIVITY TEST ---");
console.log(`Cloud Name: [${cloudName}] (Length: ${cloudName.length})`);
console.log(`API Key:    [${apiKey}] (Length: ${apiKey.length})`);
console.log(`API Secret: [${apiSecret.substring(0, 4)}...]`);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const testConnection = async () => {
  try {
    console.log("Attempting to ping Cloudinary API...");
    const result = await cloudinary.api.ping();
    console.log("✅ SUCCESS! Cloudinary is connected.");
    console.log("Result:", result);
    process.exit(0);
  } catch (error) {
    console.error("❌ FAILED! Could not connect to Cloudinary.");
    console.error("Error Detail:", error.message);
    if (error.message.includes("Invalid cloud_name")) {
        console.log("\n💡 TIP: The cloud name is definitely being rejected. Check if there are any restrictions on your Cloudinary account or if the cloud name matches EXACTLY (case-sensitive).");
    }
    process.exit(1);
  }
};

testConnection();
