import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getUserLocale } from "@/actions/locale";
import { locales } from "@/i18n/config";
import "@/app/globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata = {
  title: "Bondy | Keep connect with the world!",
  description: "Let's have a cup of tea with Bondy.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getUserLocale();

  if (!locales.includes(locale as "en" | "vi")) {
    notFound();
  }

  const messages = (await import(`@/translations/${locale}.json`)).default;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="min-h-screen bg-gray-50"
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ToastContainer />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
