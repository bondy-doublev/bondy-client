import {
  Home,
  Search,
  Compass,
  Video,
  Send,
  Heart,
  Plus,
  Menu,
  Grid,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { id: "home", label: "Trang chủ", icon: <Home /> },
  { id: "search", label: "Tìm kiếm", icon: <Search /> },
  { id: "explore", label: "Khám phá", icon: <Compass /> },
  { id: "reels", label: "Reels", icon: <Video /> },
  { id: "messages", label: "Tin nhắn", icon: <Send />, badge: 2 },
  { id: "notifications", label: "Thông báo", icon: <Heart />, badge: 1 },
  { id: "create", label: "Tạo", icon: <Plus /> },
  { id: "more", label: "Xem thêm", icon: <Menu /> },
  { id: "meta", label: "Củng của Meta", icon: <Grid /> },
];
