import { requireAdmin } from "@/domains/admin/auth";
import { getServerOrigin } from "@/domains/smart";

async function fetchSessionsCount(): Promise<number> {
  const origin = await getServerOrigin();
  const res = await fetch(`${origin}/api/admin/sessions/count`, {
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as { count?: number };
  return data.count ?? 0;
}

async function fetchSmartClients(): Promise<
  { id: string; key: string; value: unknown }[]
> {
  const origin = await getServerOrigin();
  const res = await fetch(`${origin}/api/admin/kv/smart-clients`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    clients?: { id: string; key: string; value: unknown }[];
  };
  return data.clients ?? [];
}

export default async function AdminPage() {
  await requireAdmin();
  const [count, clients] = await Promise.all([
    fetchSessionsCount(),
    fetchSmartClients(),
  ]);
  return (
    <main className="p-6 space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Restricted to awellhealth.com</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-medium">Navi Sessions</h2>
        <div className="rounded border p-4 inline-block">
          <div className="text-4xl font-bold">{count}</div>
          <div className="text-sm text-gray-500">active session records</div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">SMART Clients (KV)</h2>
        <AdminSmartClients initialClients={clients} />
      </section>
    </main>
  );
}

function AdminSmartClients({
  initialClients,
}: {
  initialClients: { id: string; key: string; value: unknown }[];
}) {
  return (
    <form
      className="space-y-4"
      action={async (formData: FormData) => {
        "use server";
        await requireAdmin();
        const id = String(formData.get("id") ?? "").trim();
        const valueRaw = String(formData.get("value") ?? "");
        const value = valueRaw ? JSON.parse(valueRaw) : null;
        await fetch(`/api/admin/kv/smart-clients`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id, value }),
        });
      }}
    >
      <div className="flex items-end gap-2">
        <label className="flex flex-col">
          <span className="text-sm">Client ID</span>
          <input name="id" className="border rounded px-2 py-1" />
        </label>
        <label className="flex-1 flex flex-col">
          <span className="text-sm">JSON Value</span>
          <textarea name="value" className="border rounded px-2 py-1 h-24" />
        </label>
        <button
          type="submit"
          className="border rounded px-3 py-2 bg-black text-white"
        >
          Save
        </button>
      </div>

      <div className="mt-6">
        <table className="w-full text-left border">
          <thead>
            <tr className="border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Key</th>
              <th className="p-2">Value</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialClients.map((c) => (
              <tr key={c.key} className="border-b align-top">
                <td className="p-2 font-mono">{c.id}</td>
                <td className="p-2 font-mono">{c.key}</td>
                <td className="p-2 whitespace-pre-wrap break-all">
                  {JSON.stringify(c.value, null, 2)}
                </td>
                <td className="p-2">
                  <form
                    action={async () => {
                      "use server";
                      await requireAdmin();
                      await fetch(
                        `/api/admin/kv/smart-clients?id=${encodeURIComponent(
                          c.id
                        )}`,
                        {
                          method: "DELETE",
                        }
                      );
                    }}
                  >
                    <button className="border rounded px-2 py-1">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}
