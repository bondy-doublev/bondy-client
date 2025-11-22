"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { uploadCloudinaryVideoSingle } from "@/services/uploadService";
import { CreateReelRequest } from "@/types/request";
import { useState } from "react";

export default function CreateReelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [visibility, setVisibility] = useState<ReelVisibility>(
    ReelVisibility.PUBLIC
  );
  const [customAllowedUsers, setCustomAllowedUsers] = useState<number[]>([]);
  const [ttlHours, setTtlHours] = useState<number>(24);
  const [userId, setUserId] = useState<number>(1); // demo, sau gắn auth

  // Handle file upload selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setVideoPreview(URL.createObjectURL(f));
    }
  };

  // Submit form
  const handleCreateReel = async () => {
    if (!file) {
      alert("Chọn video trước ba");
      return;
    }

    try {
      setIsUploading(true);

      // STEP 1 → Upload video Cloudinary
      const videoUrl = await uploadCloudinaryVideoSingle(file);

      // STEP 2 → Create Reel
      const payload: CreateReelRequest = {
        userId,
        videoUrl,
        visibilityType: visibility,
        customAllowedUserIds: visibility === "CUSTOM" ? customAllowedUsers : [],
        ttlHours,
      };

      const result = await reelService.create(payload);

      alert("Tạo reel thành công!");

      console.log("REEL CREATED:", result);
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo reel");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-semibold mb-6">Tạo Reel mới</h1>

      {/* User (demo) */}
      <label className="block mb-3">
        <span className="font-medium">User ID</span>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(Number(e.target.value))}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>

      {/* Video upload */}
      <label className="block mb-4">
        <span className="font-medium">Chọn video</span>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full mt-1"
        />
      </label>

      {/* Video preview */}
      {videoPreview && (
        <video
          src={videoPreview}
          controls
          className="w-full rounded mb-4 border"
        />
      )}

      {/* Visibility */}
      <label className="block mb-4">
        <span className="font-medium">Chế độ hiển thị</span>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ReelVisibility)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="PUBLIC">Công khai</option>
          <option value="FRIENDS">Bạn bè</option>
          <option value="CUSTOM">Tùy chọn người xem</option>
          <option value="PRIVATE">Riêng tư</option>
        </select>
      </label>

      {/* If CUSTOM, show list user input */}
      {visibility === "CUSTOM" && (
        <label className="block mb-4">
          <span className="font-medium">
            Danh sách user được xem (ID, cách nhau bằng dấu phẩy)
          </span>
          <input
            type="text"
            onChange={(e) =>
              setCustomAllowedUsers(
                e.target.value
                  .split(",")
                  .map((v) => Number(v.trim()))
                  .filter((v) => !isNaN(v))
              )
            }
            className="w-full mt-1 p-2 border rounded"
            placeholder="vd: 2, 5, 8"
          />
        </label>
      )}

      {/* TTL */}
      <label className="block mb-4">
        <span className="font-medium">TTL (giờ)</span>
        <input
          type="number"
          value={ttlHours}
          onChange={(e) => setTtlHours(Number(e.target.value))}
          min={1}
          className="w-full mt-1 p-2 border rounded"
        />
      </label>

      {/* Submit */}
      <button
        onClick={handleCreateReel}
        disabled={isUploading}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isUploading ? "Đang upload..." : "Tạo Reel"}
      </button>
    </div>
  );
}
