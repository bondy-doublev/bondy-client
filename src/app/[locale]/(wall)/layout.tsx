import AppNavbar from "@/app/layout/default/Navbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="flex justify-center">{children}</div>
        </main>
      </div>
    </div>
  );
}
