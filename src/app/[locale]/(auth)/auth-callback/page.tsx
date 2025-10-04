import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { provider?: string };
}) {
  const session = await auth();
  const provider = searchParams.provider;

  if (session?.user?.email && session?.user?.name) {
    const query = new URLSearchParams({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? "",
      provider: provider ?? "",
    });

    redirect(`auth-success?${query.toString()}`);
  }

  redirect("/");
}
