import { useState, useContext, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import ProductGrid from '../../components/catalogue/ProductGrid';
import { CartContext } from '../../context/cartContextValue';
import { fetchProducts } from '../../api/productApi';
import { fetchInventory } from '../../api/inventoryApi';
import { isVisibleProduct } from '../../utils/products';

export default function Home() {
  const { addToCart } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [inventoryBySku, setInventoryBySku] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      setInventoryBySku({});
      try {
        const data = (await fetchProducts.getAllProducts({ force: true })).filter(isVisibleProduct);
        if (!active) return;
        setProducts(data);
        setLoading(false);
        await Promise.all(
          data
            .filter((p) => p.skuCode)
            .map(async (product) => {
              let inventory = null;
              try {
                inventory = await fetchInventory.getInventory(product.skuCode);
              } catch {
                /* A failed stock lookup must not enable purchasing. */
              }
              if (active)
                setInventoryBySku((current) => ({ ...current, [product.skuCode]: inventory }));
            }),
        );
      } catch {
        if (active) setError('We could not load the catalogue. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [reload]);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );
  const filtered = useMemo(
    () =>
      products
        .filter((p) =>
          `${p.name} ${p.description ?? ''} ${p.skuCode ?? ''}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
        )
        .filter((p) => !category || p.category === category)
        .map((p) => ({
          ...p,
          inventory: inventoryBySku[p.skuCode],
          inventoryLoaded: !p.skuCode || Object.hasOwn(inventoryBySku, p.skuCode),
        }))
        .sort((a, b) =>
          sort === 'price-low'
            ? a.price - b.price
            : sort === 'price-high'
              ? b.price - a.price
              : sort === 'name'
                ? a.name.localeCompare(b.name)
                : 0,
        ),
    [products, search, category, sort, inventoryBySku],
  );
  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('default');
  };

  return (
    <>
      <PageHeader
        title="Explore the catalogue"
        subtitle="Find your next pick. Check availability and order in a few simple steps."
      />
      <section
        className="catalogue-toolbar"
        aria-label="Filter products"
      >
        <div className="catalogue-search">
          <label htmlFor="search">Search products</label>
          <input
            id="search"
            className="form-control"
            type="search"
            placeholder="Name, description or SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Featured</option>
            <option value="name">Name: A to Z</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
          </select>
        </div>
      </section>
      {loading ? (
        <div
          className="state-panel"
          role="status"
        >
          <span
            className="spinner-border"
            aria-hidden="true"
          />
          <p>Loading catalogue...</p>
        </div>
      ) : error ? (
        <div
          className="state-panel"
          role="alert"
        >
          <h2 className="h5">Catalogue unavailable</h2>
          <p>{error}</p>
          <button
            className="btn btn-dark"
            onClick={() => setReload((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="catalogue-results">
            <span role="status">
              {filtered.length} product{filtered.length === 1 ? '' : 's'}
              {category && ` in ${category}`}
            </span>
            {(search || category || sort !== 'default') && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            )}
          </div>
          {filtered.length ? (
            <ProductGrid
              products={filtered}
              onAddToCart={(id) => addToCart(products.find((p) => p.id === id))}
            />
          ) : (
            <div className="state-panel">
              <h2 className="h4">No products found</h2>
              <p>Try a different search or browse all categories.</p>
              <button
                className="btn btn-dark"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
