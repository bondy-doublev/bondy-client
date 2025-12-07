// src/app/(client)/friends/page.tsx

import FriendSuggestion from "@/app/[locale]/(client)/friends/components/FriendSuggestion";

export default function FriendsRootPage() {
  // layout.tsx sẽ wrap file này, nên chỉ render nội dung chính
  return <FriendSuggestion />;
}
