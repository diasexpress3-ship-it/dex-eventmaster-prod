import React, { useState } from "react";
import { uploadImage } from "../../services/storageService";
import { compressImage } from "../../utils/imageCompress";

type Props = {
  path: string;
  onUploadSuccess?: (url: string) => void;
  onError?: (message: string) => void;
};

export default function FirebaseUploader({ path, onUploadSuccess, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const optimized = await compressImage(file);

      // Fix: swapped arguments to match the signature uploadImage(file: File, path: string) from storageService.ts
      const url = await uploadImage(
        optimized,
        `${path}/${Date.now()}-${file.name}`
      );

      onUploadSuccess?.(url);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
      />

      {loading && <p>Enviando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
