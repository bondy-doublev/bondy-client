'use client'

import { chatService } from "@/services/chatService";
import { useEffect } from "react";

function Hello() {
  const handleHello = async () => {
    const response = await chatService.hello();
    console.log(response);
  };

  useEffect(() => {
    handleHello();
  }, []);

  return (
    <div>
      <h1>Hello from the Communication Service!</h1>
    </div>
  );
}

export default Hello;
