import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const session = await auth();

  if (session?.user?.email && session?.user?.name) {
    const query = new URLSearchParams({
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? "",
    });

    redirect(`auth-success?${query.toString()}`);
  }

  redirect("/");
}
