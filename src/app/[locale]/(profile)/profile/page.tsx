"use client";

import { useTranslations } from "use-intl";
import ProfileForm from "@/app/components/user/Profile";
import ChangePassword from "@/app/components/user/ChangePassword";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ProfilePageWithTabs() {
  const t = useTranslations("user");

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start px-4 py-12">
      <Card className="w-full max-w-4xl p-6 shadow-md bg-white">
        <Tabs defaultValue="profile" className="w-full">
          {/* Tab headers */}
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

          {/* Tab content */}
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>
          <TabsContent value="password">
            <ChangePassword />
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
