// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   Save,
//   RotateCcw,
//   Search,
//   PackagePlus,
//   PencilLine,
//   ChevronLeft,
//   ChevronRight,
//   Package,
// } from "lucide-react";

// // --- HELPERS (DI LUAR KOMPONEN UTAMA AGAR TIDAK RE-RENDER) ---

// function rp(n) {
//   return `Rp ${Number(n || 0).toLocaleString("id-ID")}`;
// }

// const Field = ({ label, children }) => (
//   <div className="flex flex-col gap-1">
//     <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">
//       {label}
//     </label>
//     {children}
//   </div>
// );

// // --- KOMPONEN UTAMA ---

// export default function ProductsAdminPage() {
//   const [q, setQ] = useState("");
//   const [data, setData] = useState({ items: [], total: 0, take: 20, skip: 0 });
//   const [categories, setCategories] = useState([]);
//   const [busy, setBusy] = useState(false);
//   const [error, setError] = useState(null);

//   const [form, setForm] = useState({
//     id: null,
//     name: "",
//     sku: "",
//     barcode: "",
//     price: "", // String kosong agar tidak muncul angka 0 yang mengganggu
//     cost: "",
//     qtyOnHand: "",
//     categoryId: "",
//     isActive: true,
//   });

//   const mode = useMemo(() => (form.id ? "edit" : "create"), [form.id]);

//   // --- API FUNCTIONS ---

//   async function loadCategories() {
//     try {
//       const res = await fetch("/api/admin/categories");
//       const json = await res.json();
//       if (!res.ok)
//         throw new Error(json.error?.message || "Failed load categories");
//       setCategories(json.data || []);
//     } catch (e) {
//       setError(e.message);
//     }
//   }

//   async function loadProducts({ skip = 0 } = {}) {
//     setError(null);
//     const params = new URLSearchParams();
//     if (q.trim()) params.set("q", q.trim());
//     params.set("take", "20");
//     params.set("skip", String(skip));

//     try {
//       const res = await fetch(`/api/admin/products?${params.toString()}`);
//       const json = await res.json();
//       if (!res.ok)
//         throw new Error(json.error?.message || "Failed load products");
//       setData(json.data);
//     } catch (e) {
//       setError(e.message);
//     }
//   }

//   useEffect(() => {
//     loadCategories();
//     loadProducts();
//   }, []);

//   useEffect(() => {
//     const t = setTimeout(() => loadProducts({ skip: 0 }), 300);
//     return () => clearTimeout(t);
//   }, [q]);

//   // --- FORM ACTIONS ---

//   function resetForm() {
//     setForm({
//       id: null,
//       name: "",
//       sku: "",
//       barcode: "",
//       price: "",
//       cost: "",
//       qtyOnHand: "",
//       categoryId: "",
//       isActive: true,
//     });
//   }

//   async function submit() {
//     setBusy(true);
//     setError(null);
//     try {
//       const payload = {
//         name: form.name,
//         sku: form.sku || null,
//         barcode: form.barcode || null,
//         price: Number(form.price) || 0,
//         cost: Number(form.cost) || 0,
//         qtyOnHand: Number(form.qtyOnHand) || 0,
//         categoryId: form.categoryId || null,
//         isActive: !!form.isActive,
//       };

//       const res = await fetch(
//         form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
//         {
//           method: form.id ? "PUT" : "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         },
//       );

//       const json = await res.json();
//       if (!res.ok) throw new Error(json.error?.message || "Failed save");

//       resetForm();
//       await loadProducts({ skip: 0 });
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function edit(p) {
//     setForm({
//       id: p.id,
//       name: p.name || "",
//       sku: p.sku || "",
//       barcode: p.barcode || "",
//       price: p.price || "",
//       cost: p.cost || "",
//       qtyOnHand: p.inventory?.qtyOnHand || "",
//       categoryId: p.categoryId || "",
//       isActive: p.isActive !== false,
//     });
//   }

//   async function toggleStatus(p) {
//     const actionText = p.isActive ? "Nonaktifkan" : "Aktifkan";
//     if (!confirm(`${actionText} product ini?`)) return;

//     setBusy(true);
//     setError(null);
//     try {
//       // Jika aktif -> DELETE (Soft Delete)
//       // Jika tidak aktif -> PUT/PATCH untuk mengaktifkan kembali
//       const res = await fetch(`/api/admin/products/${p.id}`, {
//         method: p.isActive ? "DELETE" : "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: p.isActive ? null : JSON.stringify({ ...p, isActive: true }),
//       });

//       if (!res.ok) throw new Error(`Failed to ${actionText}`);

//       await loadProducts({ skip: data.skip });
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setBusy(false);
//     }
//   }

//   const canPrev = data.skip > 0;
//   const canNext = data.skip + data.take < data.total;

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//       {/* BAGIAN FORM (KIRI) */}
//       <div className="lg:col-span-1 space-y-4">
//         <div className="rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-zinc-200/50">
//           <div className="flex items-center gap-2 mb-6">
//             <div
//               className={`p-2 rounded-lg ${mode === "create" ? "bg-zinc-100 text-zinc-600" : "bg-blue-50 text-blue-600"}`}
//             >
//               {mode === "create" ? (
//                 <PackagePlus size={20} />
//               ) : (
//                 <PencilLine size={20} />
//               )}
//             </div>
//             <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
//               {mode === "create" ? "New Product" : "Edit Product"}
//             </h2>
//           </div>

//           <div className="space-y-4">
//             <Field label="Product Name">
//               <input
//                 className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                 placeholder="Mineral Water 500ml"
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, name: e.target.value }))
//                 }
//                 disabled={busy}
//               />
//             </Field>

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="SKU">
//                 <input
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                   placeholder="SKU-XXX"
//                   value={form.sku}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, sku: e.target.value }))
//                   }
//                   disabled={busy}
//                 />
//               </Field>
//               <Field label="Barcode">
//                 <input
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                   placeholder="899..."
//                   value={form.barcode}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, barcode: e.target.value }))
//                   }
//                   disabled={busy}
//                 />
//               </Field>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Selling Price">
//                 <input
//                   type="number"
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                   placeholder="0"
//                   value={form.price}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, price: e.target.value }))
//                   }
//                   disabled={busy}
//                 />
//               </Field>
//               <Field label="Capital Cost">
//                 <input
//                   type="number"
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                   placeholder="0"
//                   value={form.cost}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, cost: e.target.value }))
//                   }
//                   disabled={busy}
//                 />
//               </Field>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <Field label="Stock Level">
//                 <input
//                   type="number"
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//                   placeholder="0"
//                   value={form.qtyOnHand}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, qtyOnHand: e.target.value }))
//                   }
//                   disabled={busy}
//                 />
//               </Field>
//               <Field label="Category">
//                 <select
//                   className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition bg-white"
//                   value={form.categoryId || ""}
//                   onChange={(e) =>
//                     setForm((s) => ({ ...s, categoryId: e.target.value }))
//                   }
//                   disabled={busy}
//                 >
//                   <option value="">(None)</option>
//                   {categories.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               </Field>
//             </div>

//             <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 cursor-pointer hover:bg-zinc-50 transition">
//               <input
//                 type="checkbox"
//                 className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
//                 checked={!!form.isActive}
//                 onChange={(e) =>
//                   setForm((s) => ({ ...s, isActive: e.target.checked }))
//                 }
//                 disabled={busy}
//               />
//               <span className="text-sm font-medium text-zinc-700">
//                 Display in POS
//               </span>
//             </label>

//             <div className="flex gap-3 pt-2">
//               <button
//                 className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:opacity-50 transition shadow-sm shadow-zinc-200"
//                 onClick={submit}
//                 disabled={busy}
//               >
//                 <Save size={18} />
//                 {mode === "create" ? "Save Product" : "Update Product"}
//               </button>
//               <button
//                 className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition"
//                 onClick={resetForm}
//                 disabled={busy}
//               >
//                 <RotateCcw size={18} />
//               </button>
//             </div>

//             {error && (
//               <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* BAGIAN LIST (KANAN) */}
//       <div className="lg:col-span-2 space-y-4">
//         {/* Search Bar */}
//         <div className="rounded-2xl border bg-white p-4 shadow-sm ring-1 ring-zinc-200/50">
//           <div className="relative">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
//               size={18}
//             />
//             <input
//               className="w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition"
//               placeholder="Search inventory..."
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               disabled={busy}
//             />
//           </div>
//         </div>

//         {/* Product Table List */}
//         <div className="rounded-2xl border bg-white shadow-sm ring-1 ring-zinc-200/50 overflow-hidden">
//           <div className="border-b bg-zinc-50/50 p-4 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Package size={16} className="text-zinc-400" />
//               <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">
//                 Master Data
//               </h3>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 className="p-2 rounded-lg border bg-white hover:bg-zinc-50 disabled:opacity-30"
//                 disabled={!canPrev || busy}
//                 onClick={() =>
//                   loadProducts({ skip: Math.max(0, data.skip - data.take) })
//                 }
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <button
//                 className="p-2 rounded-lg border bg-white hover:bg-zinc-50 disabled:opacity-30"
//                 disabled={!canNext || busy}
//                 onClick={() => loadProducts({ skip: data.skip + data.take })}
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>

//           <div className="divide-y divide-zinc-100">
//             {data.items.length === 0 ? (
//               <div className="p-12 text-center text-sm text-zinc-400 italic font-medium">
//                 No records found.
//               </div>
//             ) : (
//               data.items.map((p) => (
//                 <div
//                   key={p.id}
//                   className="p-4 hover:bg-zinc-50/50 transition flex items-center justify-between gap-4 group"
//                 >
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-center gap-2 mb-1">
//                       <span className="font-bold text-zinc-900 truncate">
//                         {p.name}
//                       </span>

//                       {/* INDIKATOR STATUS AKTIF */}
//                       <span
//                         className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight ${
//                           p.isActive
//                             ? "bg-green-100 text-green-700"
//                             : "bg-zinc-100 text-zinc-400"
//                         }`}
//                       >
//                         {p.isActive ? "Active" : "Inactive"}
//                       </span>
//                     </div>

//                     <div className="text-[11px] text-zinc-500 font-medium">
//                       SKU: <span className="text-zinc-800">{p.sku || "-"}</span>{" "}
//                       • Cat:{" "}
//                       <span className="text-zinc-800">
//                         {p.category?.name || "None"}
//                       </span>
//                     </div>

//                     <div className="flex items-center gap-5 mt-3">
//                       <div>
//                         <span className="block text-[9px] uppercase font-bold text-zinc-400">
//                           Sell Price
//                         </span>
//                         <span className="font-bold text-zinc-900 text-sm">
//                           {rp(p.price)}
//                         </span>
//                       </div>
//                       <div>
//                         <span className="block text-[9px] uppercase font-bold text-zinc-400">
//                           Stock
//                         </span>
//                         <span
//                           className={`font-bold text-sm ${p.inventory?.qtyOnHand < 5 ? "text-red-500" : "text-zinc-900"}`}
//                         >
//                           {p.inventory?.qtyOnHand ?? 0}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-xs font-bold text-zinc-700 hover:bg-zinc-100 shadow-sm transition"
//                       onClick={() => edit(p)}
//                       disabled={busy}
//                     >
//                       Edit
//                     </button>
//                     <button
//                       className={`h-9 px-3 rounded-lg border text-xs font-bold shadow-sm transition ${
//                         p.isActive
//                           ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
//                           : "border-green-100 bg-green-50 text-green-600 hover:bg-green-100"
//                       }`}
//                       onClick={() => toggleStatus(p)} // Kirim seluruh objek p, bukan cuma id
//                       disabled={busy}
//                     >
//                       {p.isActive ? "Disable" : "Enable"}
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import ProductsForm from "@/ui/components/admin/ProductsForm";
import ProductsToolbar from "@/ui/components/admin/ProductsToolbar";
import ProductsList from "@/ui/components/admin/ProductsList";

export default function ProductsAdminPage() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({ items: [], total: 0, take: 20, skip: 0 });
  const [categories, setCategories] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    id: null,
    name: "",
    sku: "",
    barcode: "",
    price: "",
    cost: "",
    qtyOnHand: "",
    categoryId: "",
    isActive: true,
  });

  const mode = useMemo(() => (form.id ? "edit" : "create"), [form.id]);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load categories");
      setCategories(json.data || []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadProducts({ skip = 0 } = {}) {
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("take", "20");
    params.set("skip", String(skip));

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error?.message || "Failed load products");
      setData(json.data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProducts({ skip: 0 }), 300);
    return () => clearTimeout(t);
  }, [q]);

  function resetForm() {
    setForm({
      id: null,
      name: "",
      sku: "",
      barcode: "",
      price: "",
      cost: "",
      qtyOnHand: "",
      categoryId: "",
      isActive: true,
    });
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        barcode: form.barcode || null,
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        qtyOnHand: Number(form.qtyOnHand) || 0,
        categoryId: form.categoryId || null,
        isActive: !!form.isActive,
      };

      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : "/api/admin/products",
        {
          method: form.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed save");

      resetForm();
      await loadProducts({ skip: 0 });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function edit(p) {
    setForm({
      id: p.id,
      name: p.name || "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      price: p.price || "",
      cost: p.cost || "",
      qtyOnHand: p.inventory?.qtyOnHand || "",
      categoryId: p.categoryId || "",
      isActive: p.isActive !== false,
    });
  }

  async function toggleStatus(p) {
    const actionText = p.isActive ? "Nonaktifkan" : "Aktifkan";
    if (!confirm(`${actionText} product ini?`)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(json.error?.message || `Failed to ${actionText}`);

      await loadProducts({ skip: data.skip });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <ProductsForm
          mode={mode}
          form={form}
          setForm={setForm}
          categories={categories}
          busy={busy}
          error={error}
          onSubmit={submit}
          onReset={resetForm}
        />
      </div>

      <div className="lg:col-span-2 space-y-4">
        <ProductsToolbar q={q} setQ={setQ} busy={busy} />

        <ProductsList
          items={data.items}
          skip={data.skip}
          take={data.take}
          total={data.total}
          busy={busy}
          onPrev={() =>
            loadProducts({ skip: Math.max(0, data.skip - data.take) })
          }
          onNext={() => loadProducts({ skip: data.skip + data.take })}
          onEdit={edit}
          onToggleStatus={toggleStatus}
        />
      </div>
    </div>
  );
}
