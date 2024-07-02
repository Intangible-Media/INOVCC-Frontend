import { deleteFile } from "../../utils/api/media";
import { ensureDomain } from "../../utils/strings";

export const useImageActions = (session, images, setActiveImage) => {
  const handleDelete = async (id) => {
    if (!session) return console.error("Not authenticated");
    try {
      await deleteFile({ id, jwt: session.accessToken });
      setActiveImage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const downloadImage = async (file) => {
    const url = ensureDomain(file.attributes?.url);

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectURL;
      a.download = file.attributes?.name || "downloaded-image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectURL); // Clean up the object URL
    } catch (error) {
      console.error("Error downloading the image", error);
    }
  };

  return { handleDelete, downloadImage };
};
