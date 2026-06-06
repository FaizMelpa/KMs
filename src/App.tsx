import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, Tag, X, Upload,
  Download, RefreshCw, Package, ChevronDown, Check,
} from "lucide-react";
import { db, type Category, type Product } from "./db";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── ProductModal ─────────────────────────────────────────────────────────────

function ProductModal({
  product, categories, onSave, onClose,
}: {
  product: Product | null;
  categories: Category[];
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState<number | "">(product?.categoryId ?? "");
  const [priceRetail, setPriceRetail] = useState(product?.priceRetail?.toString() || "");
  const [priceWholesale, setPriceWholesale] = useState(product?.priceWholesale?.toString() || "");
  const [imageData, setImageData] = useState(product?.imageData || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Compress image before storing
      const base64 = await compressImage(file, 800, 0.7);
      setImageData(base64);
    } catch {
      setError("Gagal memuat foto");
    }
    setUploading(false);
  }

  async function compressImage(file: File, maxSize: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = (h / w) * maxSize; w = maxSize; }
          else { w = (w / h) * maxSize; h = maxSize; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  function handleSave() {
    if (!name.trim()) { setError("Nama barang wajib diisi"); return; }
    setSaving(true);
    const data = {
      name,
      categoryId: categoryId || null,
      priceRetail: parseInt(priceRetail) || 0,
      priceWholesale: parseInt(priceWholesale) || 0,
      imageData: imageData || null,
    };
    if (product) {
      db.updateProduct(product.id, data);
    } else {
      db.addProduct(data);
    }
    onSave();
    onClose();
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">{product ? "Edit Barang" : "Tambah Barang"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Barang</label>
            <div
              className="relative w-full h-44 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer bg-gray-50 hover:border-emerald-400 transition-colors flex items-center justify-center"
              onClick={() => fileRef.current?.click()}
            >
              {imageData ? (
                <>
                  <img src={imageData} alt="preview" className="w-full h-full object-cover" />
                  <button
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                    onClick={(e) => { e.stopPropagation(); setImageData(""); }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  {uploading ? <RefreshCw size={28} className="animate-spin" /> : <Upload size={28} />}
                  <span className="text-sm">{uploading ? "Memproses foto..." : "Ketuk untuk pilih foto"}</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
              placeholder="Contoh: Minyak Goreng 1L"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none bg-white"
              >
                <option value="">-- Tanpa Kategori --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Eceran</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="number" inputMode="numeric" value={priceRetail}
                  onChange={(e) => setPriceRetail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                  placeholder="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga Grosir</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="number" inputMode="numeric" value={priceWholesale}
                  onChange={(e) => setPriceWholesale(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                  placeholder="0" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={18} className="animate-spin" /> : <Check size={18} />}
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CategoryModal ────────────────────────────────────────────────────────────

function CategoryModal({
  categories, onClose, onRefresh,
}: {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  function addCategory() {
    if (!newName.trim()) return;
    db.addCategory(newName.trim());
    setNewName("");
    onRefresh();
  }

  function saveEdit(id: number) {
    if (!editName.trim()) return;
    db.updateCategory(id, editName.trim());
    setEditId(null);
    onRefresh();
  }

  function deleteCategory(id: number) {
    if (!confirm("Hapus kategori ini? Barang di kategori ini tidak akan terhapus.")) return;
    db.deleteCategory(id);
    onRefresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Kelola Kategori</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <input
              type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
              placeholder="Nama kategori baru"
            />
            <button
              onClick={addCategory}
              disabled={!newName.trim()}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-60 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada kategori</p>
            )}
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2 group">
                {editId === cat.id ? (
                  <>
                    <input autoFocus type="text" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                      className="flex-1 border border-emerald-400 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
                    />
                    <button onClick={() => saveEdit(cat.id)} className="text-emerald-600 hover:text-emerald-700 p-1"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-800 px-1">{cat.name}</span>
                    <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 size={14} /></button>
                    <button onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BackupModal ──────────────────────────────────────────────────────────────

function BackupModal({ onClose, onRestore }: { onClose: () => void; onRestore: () => void }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = db.exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kasimur-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const { categories, products } = db.importBackup(text);
      setResult(`✓ Berhasil! ${categories} kategori dan ${products} barang dipulihkan.`);
      onRestore();
    } catch {
      setResult("✗ File tidak valid. Pastikan file backup yang benar.");
    }
    setImporting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Backup & Restore</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Backup Data</h3>
            <p className="text-xs text-gray-500 mb-3">Download semua data barang dan kategori sebagai file JSON.</p>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              <Download size={18} /> Download Backup
            </button>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Restore Data</h3>
            <p className="text-xs text-gray-500 mb-3">Upload file backup. <strong className="text-orange-600">Data yang ada akan dihapus.</strong></p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {importing ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
              {importing ? "Memulihkan..." : "Upload File Backup"}
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {result && (
            <p className={`text-sm rounded-lg p-3 ${result.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {result}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onEdit, onDelete }: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {product.imageData ? (
          <img src={product.imageData} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white text-blue-600"><Edit2 size={13} /></button>
          <button onClick={onDelete} className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow hover:bg-white text-red-500"><Trash2 size={13} /></button>
        </div>
        {product.categoryName && (
          <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            {product.categoryName}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate mb-2">{product.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Eceran</span>
            <span className="text-sm font-bold text-emerald-600">{formatRupiah(product.priceRetail)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Grosir</span>
            <span className="text-sm font-medium text-blue-600">{formatRupiah(product.priceWholesale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  const refresh = useCallback(() => {
    setCategories(db.getCategories());
    setProducts(db.getProducts(search, activeCategory));
  }, [search, activeCategory]);

  useEffect(() => { refresh(); }, [refresh]);

  function deleteProduct(id: number) {
    if (!confirm("Hapus barang ini?")) return;
    db.deleteProduct(id);
    refresh();
  }

  const tabs = [
    { id: "all", label: "Semua" },
    ...categories.map((c) => ({ id: String(c.id), label: c.name })),
    { id: "uncategorized", label: "Lainnya" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama barang..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all"
            />
          </div>
          <button onClick={() => setShowCategoryModal(true)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Kelola Kategori">
            <Tag size={18} />
          </button>
          <button onClick={() => setShowBackupModal(true)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" title="Backup & Restore">
            <Download size={18} />
          </button>
        </div>
        {/* Category tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === tab.id
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
            <Package size={48} />
            <p className="text-sm">{search ? "Barang tidak ditemukan" : "Belum ada barang. Tambah sekarang!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onEdit={() => { setEditProduct(p); setShowProductModal(true); }}
                onDelete={() => deleteProduct(p.id)}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mt-4">{products.length} barang</p>
      </main>

      {/* FAB */}
      <button
        onClick={() => { setEditProduct(null); setShowProductModal(true); }}
        className="fixed bottom-6 right-6 z-30 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Plus size={26} />
      </button>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onSave={refresh}
          onClose={() => setShowProductModal(false)}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onRefresh={refresh}
        />
      )}
      {showBackupModal && (
        <BackupModal
          onClose={() => setShowBackupModal(false)}
          onRestore={refresh}
        />
      )}
    </div>
  );
}
