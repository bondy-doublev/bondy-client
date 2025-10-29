import AppNavbar from "@/app/layout/default/Navbar";
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppNavbar />
      <div className="flex items-start justify-center bg-gray-50">
        {children}
      </div>
    </div>
  );
}
