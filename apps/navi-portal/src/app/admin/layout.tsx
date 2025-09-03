import Link from "next/link";
import { requireAdmin } from "@/domains/admin/auth";
import "@/app/globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b p-4 flex items-center justify-between">
        <div className="font-semibold">Navi Admin</div>
        <form
          action={async () => {
            "use server";
            const cookieStore = await import("next/headers");
            const c = await cookieStore.cookies();
            c.delete("stytch_session");
          }}
        >
          <button className="border rounded px-3 py-1">Logout</button>
        </form>
      </header>
      <nav className="p-4 border-b">
        <ul className="flex gap-4">
          <li>
            <Link href="/admin">Dashboard</Link>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  );
}
