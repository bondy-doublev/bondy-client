import { Home, Video, Send, Gamepad, Megaphone } from "lucide-react";

export const SIDEBAR_ITEMS = [
  { id: "home", href: "/", label: "Home", icon: <Home /> },
  { id: "reels", href: "/reels", label: "Reels", icon: <Video /> },
  { id: "chat", href: "/chat", label: "Chat", icon: <Send /> },
  { id: "advert", href: "/advert/list", label: "Advert", icon: <Megaphone /> },
];
