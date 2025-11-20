import { Platform } from "react-native";

const CLOUD_NAME = "dclfnxjox";
const UPLOAD_PRESET = "ml_default";

export const uploadImage = async (imageUri) => {
  if (!imageUri) return null;

  try {
    const data = new FormData();
    if (Platform.OS === "web") {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      data.append("file", blob, "upload.jpg");
    } else {
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "upload.jpg",
      });
    }

    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result = await response.json();

    if (result.secure_url) {
      return result.secure_url;
    } else {
      console.error("Error:", result);
      throw new Error("Couldn't upload image");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
