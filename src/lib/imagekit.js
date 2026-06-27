import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Server-side helper to upload an image directly from a backend buffer
 */
export async function uploadToImageKit(fileBuffer, fileName) {
  try {
    const response = await imagekit.upload({
      file: fileBuffer, // can be a base64 string, buffer, or file url
      fileName: fileName,
      folder: "/skin_analyses", // organizes uploads cleanly inside your ImageKit media library
    });
    return response; // Contains .url and .fileId for your DB storage
  } catch (error) {
    console.error("ImageKit Upload Error:", error);
    throw error;
  }
}