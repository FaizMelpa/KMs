import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Plus, Edit2, Trash2, Tag, X, Upload,
  Download, RefreshCw, Package, ChevronDown, Check,
  ChevronLeft, ChevronRight, FileText, ZoomIn,
} from "lucide-react";
import { db, type Category, type Product } from "./db";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

const FAIZ_LOGO = "data:image/png;base64,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";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

async function compressImage(file: File, maxSize = 800, quality = 0.7): Promise<string> {
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
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── ImagePreviewModal ────────────────────────────────────────────────────────
function ImagePreviewModal({ images, startIdx, onClose }: {
  images: string[];
  startIdx: number;
  onClose: () => void;
}) {
  const [cur, setCur] = useState(startIdx);

  useEffect(() => {
    const handleBack = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 z-10"><X size={20} /></button>
      <img src={images[cur]} alt="preview" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCur((cur - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2"><ChevronLeft size={20} /></button>
          <button onClick={(e) => { e.stopPropagation(); setCur((cur + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-2"><ChevronRight size={20} /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => <div key={i} className={"w-2 h-2 rounded-full " + (i === cur ? "bg-white" : "bg-white/40")} />)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ImageSlider ─────────────────────────────────────────────────────────────
function ImageSlider({ images, editable, onAdd, onRemove, onPreview }: {
  images: string[];
  editable?: boolean;
  onAdd?: (base64: string) => void;
  onRemove?: (idx: number) => void;
  onPreview?: (idx: number) => void;
}) {
  const [cur, setCur] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !onAdd) return;
    setUploading(true);
    const remaining = 3 - images.length;
    const toProcess = files.slice(0, remaining);
    for (const file of toProcess) {
      const b64 = await compressImage(file);
      onAdd(b64);
    }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="relative w-full h-52 bg-gray-100 rounded-xl overflow-hidden">
      {images.length > 0 ? (
        <>
          <img src={images[cur]} alt="product" className="w-full h-full object-cover" />
          {onPreview && (
            <button onClick={() => onPreview(cur)}
              className="absolute top-2 left-2 bg-black/40 text-white rounded-full p-1.5 backdrop-blur-sm">
              <ZoomIn size={16} />
            </button>
          )}
          {editable && onRemove && (
            <button onClick={() => { onRemove(cur); setCur(0); }}
              className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 hover:bg-white">
              <X size={14} />
            </button>
          )}
          {images.length > 1 && (
            <>
              <button onClick={() => setCur((cur - 1 + images.length) % images.length)}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1"><ChevronLeft size={16} /></button>
              <button onClick={() => setCur((cur + 1) % images.length)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1"><ChevronRight size={16} /></button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => <div key={i} className={"w-1.5 h-1.5 rounded-full " + (i === cur ? "bg-white" : "bg-white/50")} />)}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-2">
          {uploading ? <RefreshCw size={28} className="animate-spin" /> : <Upload size={28} />}
          <span className="text-sm">{uploading ? "Memproses..." : "Belum ada foto"}</span>
        </div>
      )}
      {editable && images.length < 3 && onAdd && (
        <button onClick={() => fileRef.current?.click()}
          className="absolute bottom-2 right-2 bg-emerald-500 text-white rounded-full px-2.5 py-1 text-xs flex items-center gap-1 shadow">
          <Plus size={12} /> {images.length > 0 ? `${images.length}/3` : "Foto"}
        </button>
      )}
      {editable && <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />}
    </div>
  );
}

// ─── ProductModal ─────────────────────────────────────────────────────────────
function ProductModal({ product, categories, onSave, onClose, onDelete }: {
  product: Product | null;
  categories: Category[];
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [categoryId, setCategoryId] = useState<number | "">(product?.categoryId ?? "");
  const [priceRetail, setPriceRetail] = useState(product?.priceRetail?.toString() || "");
  const [priceWholesale, setPriceWholesale] = useState(product?.priceWholesale?.toString() || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [notes, setNotes] = useState(product?.notes || "");
  const [error, setError] = useState("");
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleBack = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [onClose]);

  function handleSave() {
    if (!name.trim()) { setError("Nama barang wajib diisi"); return; }
    const data = {
      name: name.trim(),
      categoryId: categoryId || null,
      priceRetail: parseInt(priceRetail) || 0,
      priceWholesale: parseInt(priceWholesale) || 0,
      images,
      notes: notes.trim() || null,
    };
    if (product) db.updateProduct(product.id, data);
    else db.addProduct(data);
    onSave();
    onClose();
  }

  function handleDelete() {
    if (!product || !onDelete) return;
    if (!confirm("Hapus barang ini permanen?")) return;
    db.deleteProduct(product.id);
    onDelete();
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
        <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">{product ? "Edit Barang" : "Tambah Barang"}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Barang (maks. 3)</label>
              <ImageSlider images={images} editable
                onAdd={(b64) => setImages([...images, b64])}
                onRemove={(idx) => setImages(images.filter((_, i) => i !== idx))}
                onPreview={(idx) => setPreviewIdx(idx)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
                placeholder="Contoh: Sepatu Futsal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <div className="relative">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm appearance-none focus:ring-2 focus:ring-emerald-400 outline-none bg-white">
                  <option value="">-- Tanpa Kategori --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Eceran</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input type="number" inputMode="numeric" value={priceRetail} onChange={(e) => setPriceRetail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Grosir</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input type="number" inputMode="numeric" value={priceWholesale} onChange={(e) => setPriceWholesale(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none" placeholder="0" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
                placeholder="Contoh: Stok terbatas, ukuran 38-43" />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button onClick={handleSave}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Check size={18} /> Simpan
            </button>
            {product && onDelete && (
              <button onClick={handleDelete}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Trash2 size={18} /> Hapus Barang Ini
              </button>
            )}
          </div>
        </div>
      </div>
      {previewIdx !== null && (
        <ImagePreviewModal images={images} startIdx={previewIdx} onClose={() => setPreviewIdx(null)} />
      )}
    </>
  );
}

// ─── CategoryModal ────────────────────────────────────────────────────────────
function CategoryModal({ categories, onClose, onRefresh }: {
  categories: Category[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    const handleBack = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [onClose]);

  function addCategory() {
    if (!newName.trim()) return;
    db.addCategory(newName.trim());
    setNewName(""); onRefresh();
  }
  function saveEdit(id: number) {
    if (!editName.trim()) return;
    db.updateCategory(id, editName.trim());
    setEditId(null); onRefresh();
  }
  function deleteCategory(id: number) {
    if (!confirm("Hapus kategori ini?")) return;
    db.deleteCategory(id); onRefresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Kelola Kategori</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 outline-none"
              placeholder="Nama kategori baru" />
            <button onClick={addCategory} disabled={!newName.trim()}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 disabled:opacity-60">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {categories.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada kategori</p>}
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                {editId === cat.id ? (
                  <>
                    <input autoFocus type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                      className="flex-1 border border-emerald-400 rounded-lg px-3 py-1.5 text-sm outline-none" />
                    <button onClick={() => saveEdit(cat.id)} className="text-emerald-600 p-1"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="text-gray-400 p-1"><X size={16} /></button>
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

  useEffect(() => {
    const handleBack = (e: PopStateEvent) => { e.preventDefault(); onClose(); };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [onClose]);

  async function handleExport() {
    try {
      const json = db.exportBackup();
      const fileName = `KasiMurahSport-${new Date().toISOString().slice(0, 10)}.json`;
      try {
        await Filesystem.mkdir({
          path: "Download/KasiMurahSport",
          directory: Directory.ExternalStorage,
          recursive: true,
        }).catch(() => {});
        await Filesystem.writeFile({
          path: `Download/KasiMurahSport/${fileName}`,
          data: json,
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8,
        });
        setResult(`✓ Tersimpan di Download/KasiMurahSport/${fileName}`);
      } catch {
        await Share.share({
          title: "Backup KasiMurahSport",
          text: json,
          dialogTitle: "Simpan backup ke...",
        }).catch(() => {});
        setResult("✓ Backup berhasil dibagikan!");
      }
    } catch (e: any) {
      setResult("✗ Gagal backup: " + String(e));
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setResult(null);
    try {
      const text = await file.text();
      const { categories, products } = db.importBackup(text);
      setResult(`✓ Berhasil! ${categories} kategori dan ${products} barang dipulihkan.`);
      onRestore();
    } catch {
      setResult("✗ File tidak valid.");
    }
    setImporting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Backup & Restore</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Backup Data</h3>
            <p className="text-xs text-gray-500 mb-3">Simpan semua data ke folder Download HP.</p>
            <button onClick={handleExport}
              className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm">
              <Download size={18} /> Simpan Backup ke Download
            </button>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Restore Data</h3>
            <p className="text-xs text-gray-500 mb-3">Pilih file backup. <strong className="text-orange-600">Data yang ada akan dihapus.</strong></p>
            <button onClick={() => fileRef.current?.click()} disabled={importing}
              className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm">
              {importing ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} />}
              {importing ? "Memulihkan..." : "Pilih File Backup"}
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {result && (
            <p className={`text-sm rounded-lg p-3 ${result.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{result}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, onEdit }: {
  product: Product;
  onEdit: () => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = product.images || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" onClick={onEdit}>
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imgs.length > 0 ? (
          <img src={imgs[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package size={36} className="text-gray-300" /></div>
        )}
        {imgs.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + imgs.length) % imgs.length); }}
              className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-0.5"><ChevronLeft size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % imgs.length); }}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-0.5"><ChevronRight size={14} /></button>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
              {imgs.map((_, i) => <div key={i} className={"w-1 h-1 rounded-full " + (i === imgIdx ? "bg-white" : "bg-white/50")} />)}
            </div>
          </>
        )}
        {product.categoryName && (
          <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-full backdrop-blur-sm">
            {product.categoryName}
          </span>
        )}
        <div className="absolute top-1.5 right-1.5 bg-white/80 rounded-full p-1.5">
          <Edit2 size={11} className="text-gray-600" />
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-sm font-semibold text-gray-900 leading-tight truncate mb-1">{product.name}</p>
        {product.notes && (
          <div className="flex items-start gap-1 mb-1">
            <FileText size={11} className="text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 line-clamp-2">{product.notes}</p>
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Eceran</span>
            <span className="text-xs font-bold text-emerald-600">{formatRupiah(product.priceRetail)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Grosir</span>
            <span className="text-xs font-medium text-blue-600">{formatRupiah(product.priceWholesale)}</span>
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

  const tabs = [
    { id: "all", label: "Semua" },
    ...categories.map((c) => ({ id: String(c.id), label: c.name })),
    { id: "uncategorized", label: "Lainnya" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <span className="text-white font-bold text-base tracking-wide">Kasi Murah Sport</span>
        <img src={FAIZ_LOGO} alt="Logo" className="w-9 h-9 rounded-full object-cover border-2 border-emerald-400" />
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-[52px] z-30">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari barang atau catatan..."
              className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none transition-all" />
          </div>
          <button onClick={() => setShowCategoryModal(true)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"><Tag size={17} /></button>
          <button onClick={() => setShowBackupModal(true)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600"><Download size={17} /></button>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${activeCategory === tab.id ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-3 pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400 gap-3">
            <Package size={48} />
            <p className="text-sm">{search ? "Barang tidak ditemukan" : "Belum ada barang. Tambah sekarang!"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p}
                onEdit={() => { setEditProduct(p); setShowProductModal(true); }} />
            ))}
          </div>
        )}
        <p className="text-xs text-gray-400 text-center mt-3">{products.length} barang</p>
      </main>

      <button onClick={() => { setEditProduct(null); setShowProductModal(true); }}
        className="fixed bottom-6 right-5 z-30 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center">
        <Plus size={26} />
      </button>

      {showProductModal && (
        <ProductModal product={editProduct} categories={categories} onSave={refresh}
          onClose={() => setShowProductModal(false)}
          onDelete={editProduct ? () => { refresh(); setShowProductModal(false); } : undefined} />
      )}
      {showCategoryModal && (
        <CategoryModal categories={categories} onClose={() => setShowCategoryModal(false)} onRefresh={refresh} />
      )}
      {showBackupModal && (
        <BackupModal onClose={() => setShowBackupModal(false)} onRestore={refresh} />
      )}
    </div>
  );
}
