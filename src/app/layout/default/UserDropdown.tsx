"use client";

import { Dropdown, DropdownDivider, DropdownItem } from "flowbite-react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useTranslations } from "use-intl";
import { useRouter } from "next/navigation";

const UserDropdown = () => {
  const t = useTranslations("navbar");
  const { user, setUser, setTokens } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setTokens(null);
    router.push("/signin");
  };

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={<FaUser className="cursor-pointer text-lg" />}
    >
      {!user ? (
        <>
          <DropdownItem>
            <Link href={`/signin`}>{t("signIn")}</Link>
          </DropdownItem>
          <DropdownItem>
            <Link href={`/signup`}>{t("signUp")}</Link>
          </DropdownItem>
        </>
      ) : (
        <>
          <DropdownItem>
            <Link href={`/profile`}>{t("profile")}</Link>
          </DropdownItem>
          <DropdownItem>
            <Link href={`/orders`}>{t("orderHistory")}</Link>
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={handleLogout}>{t("logout")}</DropdownItem>
        </>
      )}
    </Dropdown>
  );
};

export default UserDropdown;
