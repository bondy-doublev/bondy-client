export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning={true} className="min-h-screen">
      {children}
    </div>
  );
}
