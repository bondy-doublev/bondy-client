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
      <AppSidebar /> {/* sẽ fixed bên trái */}
      {/* Nội dung chính dịch sang phải bằng đúng width sidebar */}
      <main className="md:ml-[250px] p-4 transition-all">{children}</main>
    </div>
  );
}
