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
  { id: "home", href: "/", label: "Trang chủ", icon: <Home /> },
  { id: "search", href: "/search", label: "Tìm kiếm", icon: <Search /> },
  { id: "explore", href: "/explore", label: "Khám phá", icon: <Compass /> },
  { id: "reels", href: "/reels", label: "Reels", icon: <Video /> },
  {
    id: "messages",
    href: "/chat",
    label: "Tin nhắn",
    icon: <Send />,
    badge: 2,
  },
  {
    id: "notifications",
    href: "/notifications",
    label: "Thông báo",
    icon: <Heart />,
    badge: 1,
  },
  { id: "create", href: "/create", label: "Tạo", icon: <Plus /> },
  { id: "more", href: "/more", label: "Xem thêm", icon: <Menu /> },
  { id: "meta", href: "/meta", label: "Củng của Meta", icon: <Grid /> },
];
