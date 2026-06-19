import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
        <p className="mt-2 text-gray-500">Logged in as {user.email}</p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-sm cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
