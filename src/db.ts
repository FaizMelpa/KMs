// ─── Types ───────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  priceRetail: number;
  priceWholesale: number;
  imageData: string | null; // base64 image
  createdAt: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  categories: "kasimur_categories",
  products: "kasimur_products",
  seq_cat: "kasimur_seq_cat",
  seq_prod: "kasimur_seq_prod",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextId(key: string): number {
  const n = parseInt(localStorage.getItem(key) || "0") + 1;
  localStorage.setItem(key, String(n));
  return n;
}

function loadCategories(): Category[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.categories) || "[]");
  } catch {
    return [];
  }
}

function saveCategories(cats: Category[]) {
  localStorage.setItem(KEYS.categories, JSON.stringify(cats));
}

function loadProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.products) || "[]");
  } catch {
    return [];
  }
}

function saveProducts(prods: Product[]) {
  localStorage.setItem(KEYS.products, JSON.stringify(prods));
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export const db = {
  // CATEGORIES
  getCategories(): Category[] {
    return loadCategories().sort((a, b) => a.name.localeCompare(b.name));
  },

  addCategory(name: string): Category {
    const cats = loadCategories();
    const cat: Category = { id: nextId(KEYS.seq_cat), name: name.trim(), createdAt: new Date().toISOString() };
    cats.push(cat);
    saveCategories(cats);
    return cat;
  },

  updateCategory(id: number, name: string): boolean {
    const cats = loadCategories();
    const idx = cats.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    cats[idx].name = name.trim();
    saveCategories(cats);
    return true;
  },

  deleteCategory(id: number): boolean {
    const cats = loadCategories().filter((c) => c.id !== id);
    saveCategories(cats);
    // unlink products from this category
    const prods = loadProducts().map((p) =>
      p.categoryId === id ? { ...p, categoryId: null, categoryName: null } : p
    );
    saveProducts(prods);
    return true;
  },

  // PRODUCTS
  getProducts(search?: string, categoryId?: string): Product[] {
    const cats = loadCategories();
    const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
    let prods = loadProducts().map((p) => ({
      ...p,
      categoryName: p.categoryId ? catMap[p.categoryId] || null : null,
    }));

    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (categoryId === "uncategorized") {
      prods = prods.filter((p) => p.categoryId === null);
    } else if (categoryId && categoryId !== "all") {
      prods = prods.filter((p) => p.categoryId === parseInt(categoryId));
    }

    return prods.sort((a, b) => a.name.localeCompare(b.name));
  },

  addProduct(data: Omit<Product, "id" | "categoryName" | "createdAt">): Product {
    const prods = loadProducts();
    const prod: Product = {
      ...data,
      id: nextId(KEYS.seq_prod),
      categoryName: null,
      createdAt: new Date().toISOString(),
    };
    prods.push(prod);
    saveProducts(prods);
    return prod;
  },

  updateProduct(id: number, data: Partial<Omit<Product, "id" | "categoryName" | "createdAt">>): boolean {
    const prods = loadProducts();
    const idx = prods.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    prods[idx] = { ...prods[idx], ...data };
    saveProducts(prods);
    return true;
  },

  deleteProduct(id: number): boolean {
    saveProducts(loadProducts().filter((p) => p.id !== id));
    return true;
  },

  // BACKUP & RESTORE
  exportBackup(): string {
    return JSON.stringify({
      version: 1,
      categories: loadCategories(),
      products: loadProducts(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  },

  importBackup(json: string): { categories: number; products: number } {
    const data = JSON.parse(json);
    if (!data.categories || !data.products) throw new Error("Format tidak valid");
    saveCategories(data.categories);
    saveProducts(data.products);
    // update sequences
    const maxCat = Math.max(0, ...data.categories.map((c: Category) => c.id));
    const maxProd = Math.max(0, ...data.products.map((p: Product) => p.id));
    localStorage.setItem(KEYS.seq_cat, String(maxCat));
    localStorage.setItem(KEYS.seq_prod, String(maxProd));
    return { categories: data.categories.length, products: data.products.length };
  },
};
