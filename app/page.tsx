import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Root page: redirect đến dashboard nếu đã đăng nhập, ngược lại về login.
 */
export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
