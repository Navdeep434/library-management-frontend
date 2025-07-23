"use client";

import { useEffect, useState } from "react";

export default function AuthenticatedImage({ src, token, alt, className }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`http://localhost:8080/${src}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Image fetch failed");

        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageSrc(blobUrl);
      } catch (err) {
        console.error("Error loading image", err);
        setError(true);
      }
    };

    if (src && token) fetchImage();
  }, [src, token]);

  if (error) return <div className="text-red-500">Image failed to load</div>;
  if (!imageSrc) return <div className="text-gray-500">Loading thumbnail...</div>;

  return <img src={imageSrc} alt={alt} className={className} />;
}
