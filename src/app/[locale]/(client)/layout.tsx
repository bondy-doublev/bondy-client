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
      <div className="ml-[250px] p-4">
        {" "}
        {/* margin-left = width của sidebar */}
        {children}
      </div>
    </div>
  );
}
