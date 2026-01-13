"use client";

import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import ProfileForm from "@/app/components/user/Profile";
import ChangePassword from "@/app/components/user/ChangePassword";
import Spinner from "@/app/components/ui/spinner";

import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import type User from "@/models/User";

export default function ProfilePageWithTabs() {
  const t = useTranslations("user");
  const { userId } = useParams();
  const { user } = useAuthStore();

  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const numericUserId = userId ? Number(userId) : null;

  // ✅ Là chính chủ nếu id trên URL trùng với user.id đăng nhập
  const isOwner =
    !!user && numericUserId !== null
      ? Number(user.id) === numericUserId
      : false;

  useEffect(() => {
    if (!numericUserId) return;

    (async () => {
      try {
        const res = await userService.getProfileById({
          userId: numericUserId,
        });
        setUserInfo(res.data as User);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [numericUserId]);

  if (loading) {
    return (
      <main className="md:px-4 w-full flex justify-center items-center">
        <Spinner />
      </main>
    );
  }

  if (!userInfo) {
    return (
      <main className="md:px-4 w-full flex justify-center items-center">
        <p className="text-gray-500">{t("noData") ?? "No data found"}</p>
      </main>
    );
  }

  return (
    <main className="md:px-4 w-full">
      <Card className="w-full p-6 shadow-md bg-white mx-auto">
        {isOwner ? (
          // ✅ Chính chủ: có Tabs + Change Password
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {t("info")}
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {t("changePassword")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileForm
                userInfo={userInfo}
                isOwner={true}
                onUserInfoChange={setUserInfo}
              />
            </TabsContent>

            <TabsContent value="password">
              <ChangePassword />
            </TabsContent>
          </Tabs>
        ) : (
          // ❌ Không phải chính chủ: chỉ xem thông tin, không có tab đổi mật khẩu
          <ProfileForm userInfo={userInfo} isOwner={false} />
        )}
      </Card>
    </main>
  );
}
