import { useState } from "react";
import { useAuth } from "@/lib/auth";

/** Sidebar control — switch or create brands (cloud mode). */
export function BrandSwitcher() {
  const { cloudStorage, brands, activeBrandId, brandName, switchBrand, createBrand } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!cloudStorage) return null;

  return (
    <div className="rounded-2xl bg-white/[0.06] p-3 backdrop-blur-lg">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Active brand</p>
      <select
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs"
        value={activeBrandId ?? ""}
        disabled={busy || brands.length === 0}
        onChange={(e) => {
          const id = e.target.value;
          if (!id || id === activeBrandId) return;
          setBusy(true);
          setErr(null);
          void switchBrand(id)
            .then((r) => {
              if (!r.ok) setErr(r.error ?? "Switch failed");
            })
            .finally(() => setBusy(false));
        }}
      >
        {brands.length === 0 ? (
          <option value="">{brandName || "Loading…"}</option>
        ) : (
          brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.isDefault ? " · current" : ""}
            </option>
          ))
        )}
      </select>
      <form
        className="mt-2 flex gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setBusy(true);
          setErr(null);
          void createBrand(name.trim())
            .then((r) => {
              if (!r.ok) setErr(r.error ?? "Could not create");
              else setName("");
            })
            .finally(() => setBusy(false));
        }}
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[11px]"
          placeholder="New brand"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-lg bg-white/10 px-2 py-1 text-[11px] hover:bg-white/15 disabled:opacity-40"
        >
          Add
        </button>
      </form>
      {err ? <p className="mt-1 text-[10px] text-red-300/90">{err}</p> : null}
    </div>
  );
}
