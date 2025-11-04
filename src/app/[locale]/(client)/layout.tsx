import AppSidebar from "@/app/layout/default/Sidebar";
import AppNavbar from "@/app/layout/default/Navbar";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="h-screen flex flex-col overflow-hidden">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto md:ml-[20%] p-4 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
