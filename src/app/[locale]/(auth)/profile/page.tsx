"use client";

import { useTranslations } from "use-intl";
import ProfileForm from "@/app/components/user/Profile";
import ChangePasswordPage from "@/app/components/user/ChangePassword";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProfilePageWithTabs() {
  const t = useTranslations("user");

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-8">
      <Card className="w-full max-w-4xl p-4">
        <Tabs defaultValue="profile" className="w-full">
          {/* Tab headers */}
          <TabsList>
            <TabsTrigger value="profile">{t("info")}</TabsTrigger>
            <TabsTrigger value="password">{t("changePassword")}</TabsTrigger>
          </TabsList>

          {/* Tab content */}
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="password">
            <ChangePasswordPage />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
