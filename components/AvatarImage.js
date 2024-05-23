"use client";

import { Avatar } from "flowbite-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ensureDomain } from "../utils/strings";

export default function AvatarImage({ customImage, customName }) {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    const finalName =
      customName !== undefined ? customName : session?.user?.firstName;
    setName(finalName);

    if (customImage) {
      const img = new Image();
      const fullUrl = ensureDomain(customImage);
      img.onload = () => setImageUrl(fullUrl);
      img.onerror = () => setImageUrl(null);
      img.src = fullUrl;
    } else {
      setImageUrl(null);
    }
  }, [customImage, customName, session]);

  return (
    <>
      {imageUrl ? (
        <Avatar
          alt="User settings"
          img={imageUrl}
          rounded
          className="avatar-image"
        />
      ) : (
        <Avatar placeholderInitials={name ? name.charAt(0) : "U"} rounded />
      )}
    </>
  );
}
