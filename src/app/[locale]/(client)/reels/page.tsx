'use client';

import { reelService } from "@/services/reelService";
import { useEffect } from "react";

function ReelsPage() {

  const handleGetReels = async () => {
    try {
      const response = await reelService.getPublicReels(1, 20);
    } catch (error) {
      console.error("Error fetching reels:", error);
    }
  };

  useEffect(() => {
    handleGetReels();
    document.title = "Reels - MyApp";
  }, []);
  return (  
    <h1>Reels</h1>
  );
}

export default ReelsPage;