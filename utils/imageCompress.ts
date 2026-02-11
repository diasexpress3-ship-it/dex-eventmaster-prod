export async function compressImage(
  file: File,
  quality = 0.7
): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob(
      (b) => resolve(b!),
      "image/jpeg",
      quality
    )
  );

  return new File([blob], file.name, { type: "image/jpeg" });
}
