import { useAuthStore } from "@/store/authStore";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useTranslations } from "next-intl";

export default function MyFriends() {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = user?.id ?? 0;

  const { loading, friendUsers } = useMyFriends(currentUserId);

  if (!user) {
    return <div></div>;
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold text-green-700 mb-4">
        {t("friends")}
      </h1>
      {loading ? (
        <div className="text-green-700">{t("loading")}</div>
      ) : friendUsers.length === 0 ? (
        <div className="text-gray-500">{t("noFriends")}</div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {friendUsers.map((f) => (
              <Card
                key={f.id}
                className="bg-green-100 text-black p-4 flex flex-col items-center gap-2 shadow"
              >
                <Avatar className="w-20 h-20 rounded-full">
                  {f.avatarUrl ? (
                    <AvatarImage src={f.avatarUrl} alt={f.fullName} />
                  ) : (
                    <AvatarFallback>{f.fullName}</AvatarFallback>
                  )}
                </Avatar>

                <div className="text-center mt-2">
                  <div className="font-semibold">{f.fullName}</div>
                  {f.address && (
                    <div className="text-sm text-gray-700">{f.address}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
