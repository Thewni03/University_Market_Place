/**
 * Marketplace.jsx
 * Route: /marketplace
 * Add to App.jsx:
 *   const Marketplace = lazy(() => import("./pages/Marketplace/Marketplace"));
 *   <Route path="/marketplace" element={<Marketplace />} />
 */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5001/api/marketplace";

const FACULTIES = ["All","Engineering","Computing","Business","Law","Medicine","Arts","Science","Education"];
const CATEGORIES = ["All","Textbooks","Electronics","Lab Equipment","Stationery","Furniture","Clothing","Sports","Other"];
const CONDITIONS = ["All","New","Like New","Good","Fair","Poor"];

// ── helpers ───────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token") || localStorage.getItem("authToken");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });
const fmtLKR = (n) => n === 0 ? "FREE" : `LKR ${Number(n).toLocaleString()}`;

// ── colours ───────────────────────────────────────────────────────────────────
const C = {
  bg:       "#f0f4ff",
  surface:  "#ffffff",
  surface2: "#f7f9ff",
  border:   "rgba(99,102,241,0.13)",
  indigo:   "#6366f1",
  teal:     "#0d9488",
  rose:     "#f43f5e",
  amber:    "#f59e0b",
  emerald:  "#10b981",
  text:     "#0f172a",
  textMid:  "#4b5a8a",
  textFaint:"#94a3c0",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Sora',sans-serif;background:${C.bg};color:${C.text};}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
.product-card{background:${C.surface};border:1px solid ${C.border};border-radius:16px;overflow:hidden;transition:transform 0.2s ease,box-shadow 0.2s ease;animation:fadeUp 0.3s ease both;}
.product-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(99,102,241,0.12);}
.fav-btn{background:none;border:none;cursor:pointer;font-size:20px;transition:transform 0.15s;}
.fav-btn:hover{transform:scale(1.2);}
.filter-chip{padding:6px 14px;border-radius:99px;border:1px solid ${C.border};background:none;cursor:pointer;font-size:12px;font-weight:500;font-family:'Sora',sans-serif;transition:all 0.15s;white-space:nowrap;color:${C.textMid};}
.filter-chip.on{background:${C.indigo};color:white;border-color:${C.indigo};}
.filter-chip:hover:not(.on){background:${C.surface2};}
.tab-btn{padding:10px 20px;border:none;background:none;cursor:pointer;font-size:13px;font-weight:500;font-family:'Sora',sans-serif;color:${C.textMid};border-bottom:2px solid transparent;transition:all 0.15s;}
.tab-btn.on{color:${C.indigo};border-bottom-color:${C.indigo};}
.primary-btn{background:${C.indigo};color:white;border:none;border-radius:10px;padding:10px 20px;cursor:pointer;font-size:13px;font-weight:600;font-family:'Sora',sans-serif;transition:all 0.15s;}
.primary-btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
.secondary-btn{background:none;color:${C.indigo};border:1px solid ${C.indigo};border-radius:10px;padding:10px 20px;cursor:pointer;font-size:13px;font-weight:600;font-family:'Sora',sans-serif;transition:all 0.15s;}
.secondary-btn:hover{background:rgba(99,102,241,0.08);}
input,select,textarea{font-family:'Sora',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px;}
`;

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onRemove, onBuy, onClose }) {
  const total = cart.reduce((s, p) => s + (p.isFree ? 0 : p.price), 0);
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, display:"flex" }}
      onClick={onClose}>
      <div style={{ flex:1, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)" }}/>
      <div style={{ width:380, background:C.surface, height:"100%", overflowY:"auto",
        padding:24, animation:"popIn 0.2s ease both", boxShadow:"-8px 0 40px rgba(0,0,0,0.15)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22 }}>Your Cart</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18,
            cursor:"pointer", color:C.textFaint }}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:C.textFaint }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🛒</div>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            {cart.map(p => (
              <div key={p._id} style={{ display:"flex", gap:12, padding:"14px 0",
                borderBottom:`1px solid ${C.border}`, alignItems:"center" }}>
                <div style={{ width:56, height:56, borderRadius:10, overflow:"hidden",
                  background:C.surface2, flexShrink:0 }}>
                  {p.images?.[0]
                    ? <img src={`http://localhost:5001/${p.images[0]}`}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                    : <div style={{ width:"100%", height:"100%", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:22 }}>📦</div>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:p.isFree ? C.emerald : C.indigo, fontWeight:700 }}>
                    {fmtLKR(p.price)}
                  </div>
                </div>
                <button onClick={() => onRemove(p._id)}
                  style={{ background:"none", border:"none", color:C.rose,
                    cursor:"pointer", fontSize:16 }}>✕</button>
              </div>
            ))}

            {/* Total */}
            <div style={{ padding:"16px 0", display:"flex", justifyContent:"space-between",
              fontSize:15, fontWeight:700, borderBottom:`1px solid ${C.border}`,
              marginBottom:20 }}>
              <span>Total</span>
              <span style={{ color:C.indigo }}>{fmtLKR(total)}</span>
            </div>

            {/* Buy options */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:C.textMid,
                marginBottom:10, letterSpacing:"0.06em", textTransform:"uppercase" }}>
                Choose how to buy
              </div>
              <button className="primary-btn" style={{ width:"100%", marginBottom:8,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                onClick={() => onBuy("on_campus")}>
                🏫 Meet on Campus
              </button>
              <button className="secondary-btn" style={{ width:"100%",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}
                onClick={() => onBuy("pay_first")}>
                💳 Pay First (Bank Transfer)
              </button>
            </div>

            <div style={{ fontSize:11, color:C.textFaint, textAlign:"center",
              lineHeight:1.6 }}>
              <strong>Meet on Campus:</strong> Arrange with the seller to meet in person.<br/>
              <strong>Pay First:</strong> Transfer payment, seller ships or hands over.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Add Listing Modal ────────────────────────────────────────────────────────
function AddListingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title:"", description:"", price:"", isFree:false,
    category:"Textbooks", faculty:"All", condition:"Good", paymentMethod:"both",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.description) { setError("Title and description are required"); return; }
    if (!form.isFree && !form.price) { setError("Enter a price or mark as free"); return; }
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append("images", img));
      await axios.post(API, fd, {
        headers: { ...authH(), "Content-Type":"multipart/form-data" }
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to create listing");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:8, fontSize:13,
    border:`1px solid ${C.border}`, outline:"none", background:C.surface2,
    fontFamily:"'Sora',sans-serif", color:C.text,
  };
  const labelStyle = { fontSize:11, fontWeight:600, color:C.textMid,
    letterSpacing:"0.06em", textTransform:"uppercase", display:"block", marginBottom:6 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
      backdropFilter:"blur(4px)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
      onClick={onClose}>
      <div style={{ background:C.surface, borderRadius:20, padding:28,
        width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto",
        animation:"popIn 0.2s ease both", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22 }}>
            List an Item
          </h2>
          <button onClick={onClose} style={{ background:"none", border:"none",
            fontSize:18, cursor:"pointer", color:C.textFaint }}>✕</button>
        </div>

        {error && (
          <div style={{ background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.25)",
            borderRadius:8, padding:"10px 14px", marginBottom:16,
            fontSize:13, color:C.rose }}>{error}</div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} placeholder="e.g. Data Structures textbook by Cormen"
              value={form.title} onChange={e => set("title", e.target.value)}/>
          </div>

          <div>
            <label style={labelStyle}>Description *</label>
            <textarea style={{ ...inputStyle, minHeight:80, resize:"vertical" }}
              placeholder="Condition details, edition, why selling..."
              value={form.description} onChange={e => set("description", e.target.value)}/>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={inputStyle} value={form.category}
                onChange={e => set("category", e.target.value)}>
                {CATEGORIES.filter(c => c !== "All").map(c =>
                  <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Faculty</label>
              <select style={inputStyle} value={form.faculty}
                onChange={e => set("faculty", e.target.value)}>
                {FACULTIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Condition</label>
              <select style={inputStyle} value={form.condition}
                onChange={e => set("condition", e.target.value)}>
                {CONDITIONS.filter(c => c !== "All").map(c =>
                  <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (LKR)</label>
              <input style={{ ...inputStyle, opacity: form.isFree ? 0.4 : 1 }}
                type="number" placeholder="0" min="0"
                value={form.price} disabled={form.isFree}
                onChange={e => set("price", e.target.value)}/>
            </div>
          </div>

          {/* Free toggle */}
          <div style={{ display:"flex", alignItems:"center", gap:10,
            padding:"10px 14px", background:C.surface2, borderRadius:10,
            border:`1px solid ${C.border}` }}>
            <input type="checkbox" id="isFree" checked={form.isFree}
              onChange={e => set("isFree", e.target.checked)}
              style={{ width:16, height:16, cursor:"pointer" }}/>
            <label htmlFor="isFree" style={{ fontSize:13, fontWeight:500,
              cursor:"pointer", color:C.text }}>
              This is a <strong style={{ color:C.emerald }}>FREE giveaway</strong>
            </label>
          </div>

          {/* Payment method */}
          {!form.isFree && (
            <div>
              <label style={labelStyle}>Payment method</label>
              <select style={inputStyle} value={form.paymentMethod}
                onChange={e => set("paymentMethod", e.target.value)}>
                <option value="both">Both (on campus or pay first)</option>
                <option value="on_campus">On Campus only</option>
                <option value="pay_first">Pay First only</option>
              </select>
            </div>
          )}

          {/* Images */}
          <div>
            <label style={labelStyle}>Photos (up to 4)</label>
            <input type="file" multiple accept="image/*" max={4}
              onChange={e => setImages([...e.target.files].slice(0,4))}
              style={{ fontSize:12, color:C.textMid }}/>
            {images.length > 0 && (
              <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
                {[...images].map((img, i) => (
                  <img key={i} src={URL.createObjectURL(img)}
                    style={{ width:60, height:60, objectFit:"cover",
                      borderRadius:8, border:`1px solid ${C.border}` }} alt=""/>
                ))}
              </div>
            )}
          </div>
        </div>

        <button className="primary-btn" style={{ width:"100%", marginTop:20,
          padding:"12px", fontSize:14 }}
          onClick={submit} disabled={loading}>
          {loading ? "Listing…" : "📦 List Item"}
        </button>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, onToggleFav, isFavourited, cartIds }) {
  const inCart = cartIds.includes(product._id);
  return (
    <div className="product-card">
      {/* Image */}
      <div style={{ height:180, background:C.surface2, position:"relative",
        overflow:"hidden" }}>
        {product.images?.[0]
          ? <img src={`http://localhost:5001/${product.images[0]}`}
              style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={product.title}/>
          : <div style={{ width:"100%", height:"100%", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:48 }}>📦</div>}

        {/* Free badge */}
        {product.isFree && (
          <div style={{ position:"absolute", top:10, left:10,
            background:C.emerald, color:"white", borderRadius:6,
            padding:"3px 10px", fontSize:11, fontWeight:700 }}>FREE</div>
        )}

        {/* Condition badge */}
        <div style={{ position:"absolute", top:10, right:10,
          background:"rgba(0,0,0,0.6)", color:"white", borderRadius:6,
          padding:"3px 8px", fontSize:10, fontWeight:600 }}>
          {product.condition}
        </div>

        {/* Fav button */}
        <button className="fav-btn" onClick={() => onToggleFav(product._id)}
          style={{ position:"absolute", bottom:8, right:8,
            background:"rgba(255,255,255,0.9)", borderRadius:"50%",
            width:32, height:32, display:"flex", alignItems:"center",
            justifyContent:"center" }}>
          {isFavourited ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:6 }}>
          <div style={{ fontSize:13, fontWeight:600, flex:1,
            overflow:"hidden", textOverflow:"ellipsis",
            display:"-webkit-box", WebkitLineClamp:2,
            WebkitBoxOrient:"vertical" }}>
            {product.title}
          </div>
        </div>

        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          <span style={{ background:`rgba(99,102,241,0.08)`, color:C.indigo,
            borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:600 }}>
            {product.category}
          </span>
          <span style={{ background:`rgba(13,148,136,0.08)`, color:C.teal,
            borderRadius:99, padding:"2px 8px", fontSize:10, fontWeight:600 }}>
            {product.faculty}
          </span>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"center" }}>
          <div style={{ fontSize:16, fontWeight:700,
            color: product.isFree ? C.emerald : C.indigo }}>
            {fmtLKR(product.price)}
          </div>
          <div style={{ fontSize:11, color:C.textFaint }}>
            👁 {product.viewCount || 0}
          </div>
        </div>

        <div style={{ fontSize:11, color:C.textFaint, marginTop:4, marginBottom:12 }}>
          by {product.seller?.fullname || "Unknown"}
        </div>

        <button
          onClick={() => !inCart && onAddToCart(product)}
          style={{
            width:"100%", padding:"9px", borderRadius:10,
            border:`1px solid ${inCart ? C.emerald : C.indigo}`,
            background: inCart ? `${C.emerald}12` : C.indigo,
            color: inCart ? C.emerald : "white",
            fontSize:12, fontWeight:600, cursor: inCart ? "default" : "pointer",
            fontFamily:"'Sora',sans-serif", transition:"all 0.15s",
          }}>
          {inCart ? "✓ In Cart" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Marketplace() {
  const navigate = useNavigate();
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState("browse"); // browse | free | my-listings | favourites | purchases
  const [cart,         setCart]         = useState([]);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [showAdd,      setShowAdd]      = useState(false);
  const [favourites,   setFavourites]   = useState([]);
  const [myListings,   setMyListings]   = useState([]);
  const [myPurchases,  setMyPurchases]  = useState([]);
  const [faculty,      setFaculty]      = useState("All");
  const [category,     setCategory]     = useState("All");
  const [search,       setSearch]       = useState("");
  const [buySuccess,   setBuySuccess]   = useState(null);
  const [notification, setNotification] = useState(null);

  const cartIds = cart.map(p => p._id);
  const favIds  = favourites.map(p => p._id || p);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (faculty   !== "All") params.append("faculty",  faculty);
      if (category  !== "All") params.append("category", category);
      if (tab === "free")       params.append("isFree",   "true");
      if (search)               params.append("search",   search);

      const { data } = await axios.get(`${API}?${params}`);
      setProducts(data.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [faculty, category, tab, search]);

  const loadProfileData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [favR, listR, purR] = await Promise.all([
        axios.get(`${API}/user/favourites`,  { headers: authH() }),
        axios.get(`${API}/user/my-listings`, { headers: authH() }),
        axios.get(`${API}/user/purchases`,   { headers: authH() }),
      ]);
      setFavourites(favR.data.data  || []);
      setMyListings(listR.data.data || []);
      setMyPurchases(purR.data.data || []);
    } catch {}
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadProfileData(); }, [loadProfileData]);

  // ── Cart actions ───────────────────────────────────────────────────────────
  const addToCart = (product) => {
    if (cartIds.includes(product._id)) return;
    setCart(c => [...c, product]);
    showNotif(`"${product.title}" added to cart`);
  };

  const removeFromCart = (id) => setCart(c => c.filter(p => p._id !== id));

  const handleBuy = async (method) => {
    if (!getToken()) { navigate("/login"); return; }
    try {
      await Promise.all(
        cart.map(p =>
          axios.post(`${API}/${p._id}/buy`,
            { purchaseMethod: method },
            { headers: authH() }
          )
        )
      );
      setCart([]);
      setCartOpen(false);
      setBuySuccess(method);
      loadProfileData();
      setTimeout(() => setBuySuccess(null), 4000);
    } catch (e) {
      showNotif(e.response?.data?.message || "Purchase failed", "error");
    }
  };

  // ── Favourite toggle ───────────────────────────────────────────────────────
  const toggleFav = async (id) => {
    if (!getToken()) { navigate("/login"); return; }
    try {
      await axios.post(`${API}/${id}/favourite`, {}, { headers: authH() });
      loadProfileData();
    } catch {}
  };

  // ── Delete listing ─────────────────────────────────────────────────────────
  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: authH() });
      loadProfileData();
      loadProducts();
      showNotif("Listing deleted");
    } catch { showNotif("Failed to delete", "error"); }
  };

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const displayProducts = (tab === "free" || tab === "browse")
    ? products
    : tab === "favourites" ? favourites
    : tab === "my-listings" ? myListings
    : myPurchases;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Notification toast */}
      {notification && (
        <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
          background: notification.type==="error" ? "rgba(244,63,94,0.12)" : "rgba(16,185,129,0.12)",
          border:`1px solid ${notification.type==="error" ? C.rose+"40" : C.emerald+"40"}`,
          borderRadius:10, padding:"10px 18px", fontSize:13, fontWeight:600,
          color: notification.type==="error" ? C.rose : C.emerald,
          backdropFilter:"blur(8px)", boxShadow:"0 8px 24px rgba(0,0,0,0.15)",
          animation:"popIn 0.2s ease both" }}>
          {notification.msg}
        </div>
      )}

      {/* Buy success banner */}
      {buySuccess && (
        <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
          zIndex:9999, background:C.emerald, color:"white",
          borderRadius:12, padding:"14px 24px", fontSize:14, fontWeight:600,
          boxShadow:"0 8px 32px rgba(16,185,129,0.3)", animation:"popIn 0.2s ease both",
          textAlign:"center" }}>
          🎉 Purchase successful!{" "}
          {buySuccess === "on_campus"
            ? "Contact the seller to arrange campus pickup."
            : "Please make your payment — seller has been notified."}
        </div>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onBuy={handleBuy}
          onClose={() => setCartOpen(false)}
        />
      )}

      {/* Add listing modal */}
      {showAdd && (
        <AddListingModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { loadProducts(); loadProfileData(); showNotif("Listing created!"); }}
        />
      )}

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:14 }}>
          <div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:32,
              marginBottom:6 }}>Campus Marketplace</h1>
            <p style={{ fontSize:14, color:C.textMid }}>
              Buy, sell and give away textbooks, equipment and more — sustainably.
            </p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {/* Cart button */}
            <button onClick={() => setCartOpen(true)}
              style={{ position:"relative", background:C.surface,
                border:`1px solid ${C.border}`, borderRadius:10,
                padding:"10px 16px", cursor:"pointer", fontSize:13,
                fontWeight:600, color:C.text, display:"flex",
                alignItems:"center", gap:8 }}>
              🛒 Cart
              {cart.length > 0 && (
                <span style={{ position:"absolute", top:-6, right:-6,
                  background:C.rose, color:"white", borderRadius:"50%",
                  width:18, height:18, fontSize:11, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {cart.length}
                </span>
              )}
            </button>
            <button className="primary-btn" onClick={() => setShowAdd(true)}>
              + List Item
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`,
          marginBottom:20, overflowX:"auto" }}>
          {[
            { id:"browse",      label:"Browse All" },
            { id:"free",        label:"🎁 Free Stuff" },
            { id:"favourites",  label:`❤️ Favourites (${favourites.length})` },
            { id:"my-listings", label:`📦 My Listings (${myListings.length})` },
            { id:"purchases",   label:`🧾 Purchases (${myPurchases.length})` },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${tab===t.id?"on":""}`}
              onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters — only on browse/free tabs */}
        {(tab === "browse" || tab === "free") && (
          <div style={{ marginBottom:20 }}>
            {/* Search */}
            <input
              placeholder="Search textbooks, equipment, furniture…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", padding:"10px 16px", borderRadius:10,
                border:`1px solid ${C.border}`, fontSize:13, marginBottom:12,
                background:C.surface, color:C.text, outline:"none" }}/>

            {/* Faculty filter */}
            <div style={{ display:"flex", gap:8, overflowX:"auto",
              paddingBottom:8, marginBottom:8 }}>
              {FACULTIES.map(f => (
                <button key={f} className={`filter-chip ${faculty===f?"on":""}`}
                  onClick={() => setFaculty(f)}>{f}</button>
              ))}
            </div>

            {/* Category filter */}
            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-chip ${category===c?"on":""}`}
                  onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {/* My Listings — with delete + stats */}
        {tab === "my-listings" && (
          <div style={{ marginBottom:16 }}>
            {myListings.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:C.textFaint }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📦</div>
                <p>You haven't listed anything yet.</p>
                <button className="primary-btn" style={{ marginTop:16 }}
                  onClick={() => setShowAdd(true)}>
                  List Your First Item
                </button>
              </div>
            ) : (
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                {myListings.map(p => (
                  <div key={p._id} className="product-card">
                    <div style={{ height:160, background:C.surface2,
                      position:"relative", overflow:"hidden" }}>
                      {p.images?.[0]
                        ? <img src={`http://localhost:5001/${p.images[0]}`}
                            style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>
                        : <div style={{ width:"100%",height:"100%",display:"flex",
                            alignItems:"center",justifyContent:"center",fontSize:40 }}>📦</div>}
                      <div style={{ position:"absolute", top:10, right:10,
                        background: p.status==="sold"?"#64748b":p.status==="reserved"?C.amber:C.emerald,
                        color:"white", borderRadius:6, padding:"3px 8px",
                        fontSize:10, fontWeight:700, textTransform:"uppercase" }}>
                        {p.status}
                      </div>
                    </div>
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>{p.title}</div>
                      <div style={{ display:"flex", gap:16, fontSize:12,
                        color:C.textMid, marginBottom:12 }}>
                        <span>👁 {p.viewCount} views</span>
                        <span>❤️ {p.favouritedBy?.length || 0} saves</span>
                        <span style={{ color:C.indigo, fontWeight:700 }}>{fmtLKR(p.price)}</span>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {p.status === "reserved" && (
                          <button onClick={async () => {
                            await axios.post(`${API}/${p._id}/sold`,{},{headers:authH()});
                            loadProfileData();
                            showNotif("Marked as sold!");
                          }} className="primary-btn" style={{ flex:1, padding:"8px" }}>
                            Mark Sold
                          </button>
                        )}
                        <button onClick={() => deleteListing(p._id)}
                          style={{ flex:1, padding:"8px", borderRadius:8,
                            border:`1px solid ${C.rose}30`, background:`${C.rose}10`,
                            color:C.rose, fontSize:12, fontWeight:600,
                            cursor:"pointer", fontFamily:"'Sora',sans-serif" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purchases history */}
        {tab === "purchases" && (
          <div>
            {myPurchases.length === 0 ? (
              <div style={{ textAlign:"center", padding:60, color:C.textFaint }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
                <p>No purchases yet.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {myPurchases.map(p => (
                  <div key={p._id} style={{ background:C.surface,
                    border:`1px solid ${C.border}`, borderRadius:14,
                    padding:"16px 20px", display:"flex",
                    justifyContent:"space-between", alignItems:"center",
                    flexWrap:"wrap", gap:12 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                      <div style={{ width:52, height:52, borderRadius:10,
                        background:C.surface2, overflow:"hidden", flexShrink:0 }}>
                        {p.images?.[0]
                          ? <img src={`http://localhost:5001/${p.images[0]}`}
                              style={{ width:"100%",height:"100%",objectFit:"cover" }} alt=""/>
                          : <div style={{ width:"100%",height:"100%",display:"flex",
                              alignItems:"center",justifyContent:"center",fontSize:22 }}>📦</div>}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{p.title}</div>
                        <div style={{ fontSize:11, color:C.textMid, marginTop:2 }}>
                          Seller: {p.seller?.fullname} · {p.seller?.email}
                        </div>
                        <div style={{ fontSize:11, color:C.textFaint, marginTop:1 }}>
                          {p.purchaseMethod === "on_campus" ? "🏫 Meet on campus" : "💳 Pay first"}
                          {" · "}{new Date(p.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:15, fontWeight:700, color:C.indigo }}>
                        {fmtLKR(p.price)}
                      </div>
                      <div style={{ fontSize:11, marginTop:2,
                        color: p.status==="sold"?"#64748b":C.amber,
                        fontWeight:600, textTransform:"uppercase" }}>
                        {p.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product grid — browse, free, favourites */}
        {(tab === "browse" || tab === "free" || tab === "favourites") && (
          <>
            {loading ? (
              <div style={{ textAlign:"center", padding:80 }}>
                <div style={{ width:32, height:32, border:"3px solid #e2e8f0",
                  borderTop:`3px solid ${C.indigo}`, borderRadius:"50%",
                  animation:"spin 0.7s linear infinite", margin:"0 auto 12px" }}/>
                <p style={{ color:C.textFaint, fontSize:13 }}>Loading marketplace…</p>
              </div>
            ) : displayProducts.length === 0 ? (
              <div style={{ textAlign:"center", padding:80, color:C.textFaint }}>
                <div style={{ fontSize:48, marginBottom:12 }}>
                  {tab==="free" ? "🎁" : tab==="favourites" ? "❤️" : "📦"}
                </div>
                <p style={{ fontSize:14 }}>
                  {tab==="free" ? "No free items right now. Check back soon!"
                  : tab==="favourites" ? "No favourites yet. Heart items you like!"
                  : "No items found. Try changing your filters."}
                </p>
              </div>
            ) : (
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",
                gap:16 }}>
                {displayProducts.map(p => (
                  <ProductCard key={p._id} product={p}
                    onAddToCart={addToCart}
                    onToggleFav={toggleFav}
                    isFavourited={favIds.includes(p._id)}
                    cartIds={cartIds}/>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}