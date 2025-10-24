import { api } from "../lib/axios";

const BASE = process.env.NEXT_PUBLIC_API_URL;

type AppApiResponse<T> = { code?: number; message?: string; data: T };

// Upload 1 file lên Cloudinary -> trả về 1 URL
export async function uploadCloudinarySingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post<AppApiResponse<string>>(
    `${BASE}/upload/cloudinary`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data.data; // AppApiResponse.data
}

// Upload nhiều file lên Cloudinary -> trả về mảng URL
export async function uploadCloudinaryMultiple(
  files: File[]
): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await api.post<AppApiResponse<string[]>>(
    `${BASE}/upload/cloudinary/multiple`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data.data; // AppApiResponse.data
}

// Tuỳ chọn: upload local (nếu dùng)
export async function uploadLocalSingle(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<AppApiResponse<string>>(
    `${BASE}/upload/local`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data;
}

export async function uploadLocalMultiple(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await api.post<AppApiResponse<string[]>>(
    `${BASE}/upload/local/multiple`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data.data;
}

import type { Attachment } from "@/services/chatService";

export async function uploadFilesAsAttachments(
  files: File[]
): Promise<Attachment[]> {
  const urls = await uploadCloudinaryMultiple(files);
  return urls.map((url, i) => {
    const f = files[i];
    return {
      url,
      fileName: f?.name,
      mimeType: f?.type,
      size: f?.size,
    } as Attachment;
  });
}
