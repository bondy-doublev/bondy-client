import AppSidebar from "@/app/layout/default/Sidebar";
import AppNavbar from "@/app/layout/default/Navbar";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppNavbar />
      <div className="p-4">{children}</div>
    </div>
  );
}
