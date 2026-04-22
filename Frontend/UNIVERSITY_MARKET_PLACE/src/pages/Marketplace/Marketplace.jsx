/**
 * Marketplace.jsx — Final version
 * Pay First → navigates to /marketplace/payment with order data
 * Meet on Campus → emails both parties, shows confirmation
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCart, Heart, Package, Gift, CreditCard,
  School, Trash2, Plus, Check, X, Eye,
  MapPin, Layers, ChevronLeft, ChevronRight, Bell, Mail,
} from "lucide-react";

const API = "http://localhost:5001/api/marketplace";
const IMG = "http://localhost:5001";
const FACULTIES  = ["All","Engineering","Computing","Business","Law","Medicine","Arts","Science","Education"];
const CATEGORIES = ["All","Textbooks","Electronics","Lab Equipment","Stationery","Furniture","Clothing","Sports","Other"];
const CONDITIONS = ["All","New","Like New","Good","Fair","Poor"];

const getToken = () => localStorage.getItem("token") || localStorage.getItem("authToken");
const authH    = () => ({ Authorization: `Bearer ${getToken()}` });
const fmtLKR   = (n) => n === 0 ? "FREE" : `LKR ${Number(n).toLocaleString()}`;
const imgSrc   = (p) => !p ? null : p.startsWith("http") ? p : `${IMG}/${p}`;

const T = {
  bg:"#f7f9fc", surface:"#ffffff", surface2:"#f1f5f9", surface3:"#e8eef5",
  border:"#e2e8f0", border2:"#edf2f7",
  primary:"#22c55e", primaryDark:"#16a34a", primarySoft:"#dcfce7",
  text:"#0f172a", textMid:"#475569", textFaint:"#94a3b8",
  danger:"#ef4444", dangerSoft:"#fef2f2",
  amber:"#f59e0b", amberSoft:"#fffbeb",
  indigo:"#6366f1", indigoSoft:"#eef2ff",
  teal:"#0d9488", tealSoft:"#f0fdfa",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Sora',sans-serif;background:${T.bg};color:${T.text};}
.mp-card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;
  overflow:hidden;transition:transform 0.2s ease,box-shadow 0.2s ease;animation:fadeUp 0.3s ease both;}
.mp-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.10);}
.mp-chip{padding:6px 14px;border-radius:999px;border:1px solid ${T.border};
  background:${T.surface};font-size:12px;cursor:pointer;color:${T.textMid};
  font-family:'Sora',sans-serif;font-weight:500;transition:all 0.15s;white-space:nowrap;}
.mp-chip.on{background:${T.primarySoft};color:${T.primary};border-color:${T.primary};}
.mp-chip:hover:not(.on){background:${T.surface2};}
.mp-tab{padding:10px 18px;background:none;border:none;font-size:12px;cursor:pointer;
  color:${T.textFaint};border-bottom:2px solid transparent;font-family:'Sora',sans-serif;
  font-weight:500;transition:all 0.15s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
.mp-tab.on{color:${T.primary};border-bottom-color:${T.primary};}
.mp-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
  border-radius:10px;font-family:'Sora',sans-serif;font-weight:600;cursor:pointer;transition:all 0.18s;}
.mp-btn-primary{background:${T.primary};color:white;padding:10px 18px;font-size:13px;border:none;}
.mp-btn-primary:hover{background:${T.primaryDark};transform:translateY(-1px);}
.mp-btn-primary:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
.mp-btn-outline{background:white;color:${T.primary};border:1.5px solid ${T.primary};padding:10px 18px;font-size:13px;}
.mp-btn-outline:hover{background:${T.primarySoft};transform:translateY(-1px);}
.mp-btn-ghost{background:${T.surface2};color:${T.textMid};border:1px solid ${T.border};padding:8px 14px;font-size:12px;}
.mp-btn-ghost:hover{background:${T.surface3};}
.mp-input{width:100%;padding:10px 14px;border-radius:10px;border:1px solid ${T.border};
  background:white;font-size:13px;font-family:'Sora',sans-serif;color:${T.text};
  transition:border-color 0.15s;outline:none;}
.mp-input:focus{border-color:${T.primary};box-shadow:0 0 0 3px ${T.primarySoft};}
.mp-label{font-size:10px;font-weight:700;color:${T.textFaint};letter-spacing:0.10em;
  text-transform:uppercase;display:block;margin-bottom:6px;}
.fav-btn{position:absolute;bottom:10px;right:10px;width:34px;height:34px;border-radius:50%;
  border:1.5px solid ${T.border};background:white;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.10);}
.fav-btn:hover{transform:scale(1.12);}
.fav-btn.active{background:#fef2f2;border-color:#fca5a5;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:99px;}
`;

// ── Product Detail Modal ───────────────────────────────────────────────────────
function ProductModal({ product:p, onClose, onAddToCart, onToggleFav, isFav, inCart }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!p) return null;
  const images = (p.images||[]).filter(Boolean);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",
      backdropFilter:"blur(8px)",zIndex:1500,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={onClose}>
      <div style={{background:T.surface,borderRadius:24,width:"100%",maxWidth:820,
        maxHeight:"90vh",overflowY:"auto",animation:"popIn 0.22s ease both",
        boxShadow:"0 32px 80px rgba(0,0,0,0.2)",border:`1px solid ${T.border}`,position:"relative"}}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,zIndex:10,
          background:T.surface2,border:`1px solid ${T.border}`,borderRadius:"50%",
          width:36,height:36,cursor:"pointer",display:"flex",
          alignItems:"center",justifyContent:"center",color:T.textMid}}>
          <X size={16}/>
        </button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:480}}>
          {/* Image */}
          <div style={{position:"relative",background:T.surface2,
            borderRadius:"24px 0 0 24px",overflow:"hidden",minHeight:380}}>
            {images.length>0?(
              <>
                <img src={imgSrc(images[imgIdx])} alt={p.title}
                  style={{width:"100%",height:"100%",objectFit:"cover",minHeight:380}}
                  onError={e=>e.target.style.display="none"}/>
                {images.length>1&&(<>
                  <button onClick={()=>setImgIdx(i=>(i-1+images.length)%images.length)}
                    style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
                      background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",
                      width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <ChevronLeft size={16}/>
                  </button>
                  <button onClick={()=>setImgIdx(i=>(i+1)%images.length)}
                    style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
                      background:"rgba(255,255,255,0.9)",border:"none",borderRadius:"50%",
                      width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <ChevronRight size={16}/>
                  </button>
                  <div style={{position:"absolute",bottom:12,left:0,right:0,
                    display:"flex",justifyContent:"center",gap:5}}>
                    {images.map((_,i)=>(
                      <div key={i} onClick={()=>setImgIdx(i)}
                        style={{width:i===imgIdx?20:6,height:6,borderRadius:99,
                          background:i===imgIdx?"white":"rgba(255,255,255,0.5)",
                          cursor:"pointer",transition:"all 0.2s"}}/>
                    ))}
                  </div>
                </>)}
              </>
            ):(
              <div style={{width:"100%",height:"100%",minHeight:380,display:"flex",
                alignItems:"center",justifyContent:"center",flexDirection:"column",
                gap:12,color:T.textFaint}}>
                <Package size={48} style={{opacity:0.2}}/>
                <span style={{fontSize:13}}>No photo</span>
              </div>
            )}
            {p.isFree&&<div style={{position:"absolute",top:14,left:14,
              background:T.primary,color:"white",borderRadius:8,
              padding:"4px 12px",fontSize:11,fontWeight:700}}>FREE</div>}
          </div>
          {/* Details */}
          <div style={{padding:28,display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:22,
                color:T.text,lineHeight:1.3,flex:1}}>{p.title}</h2>
              <button onClick={()=>onToggleFav(p._id)}
                style={{width:38,height:38,borderRadius:"50%",
                  background:isFav?"#fef2f2":T.surface2,
                  border:`1.5px solid ${isFav?"#fca5a5":T.border}`,
                  cursor:"pointer",display:"flex",alignItems:"center",
                  justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                <Heart size={16} fill={isFav?"#ef4444":"none"} stroke={isFav?"#ef4444":T.textFaint}/>
              </button>
            </div>
            <div style={{fontSize:28,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
              color:p.isFree?T.primary:T.text}}>{fmtLKR(p.price)}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{label:p.category,bg:T.indigoSoft,color:T.indigo},
                {label:p.faculty, bg:T.tealSoft,  color:T.teal},
                {label:p.condition,bg:T.amberSoft, color:T.amber}].map(b=>(
                <span key={b.label} style={{background:b.bg,color:b.color,
                  borderRadius:999,padding:"4px 12px",fontSize:11,fontWeight:600}}>{b.label}</span>
              ))}
            </div>
            <div style={{background:T.surface2,borderRadius:12,padding:"14px 16px",
              fontSize:13,color:T.textMid,lineHeight:1.7,flex:1,maxHeight:120,overflowY:"auto"}}>
              {p.description||"No description."}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[{icon:<Eye size={12}/>,   label:"Views",   val:`${p.viewCount||0}`},
                {icon:<Heart size={12}/>, label:"Saves",   val:`${p.favouritedBy?.length||0}`},
                {icon:<School size={12}/>,label:"Seller",  val:p.seller?.fullname||"Unknown"},
                {icon:<Mail size={12}/>,  label:"Email",   val:p.seller?.email||"—"},
                {icon:<MapPin size={12}/>,label:"Payment",
                  val:p.paymentMethod==="on_campus"?"Campus only":
                    p.paymentMethod==="pay_first"?"Pay First only":"Both options"},
              ].map(m=>(
                <div key={m.label} style={{display:"flex",alignItems:"center",
                  gap:8,fontSize:12,color:T.textMid}}>
                  <span style={{color:T.textFaint,display:"flex",width:14}}>{m.icon}</span>
                  <span style={{fontWeight:600,color:T.textFaint,minWidth:52}}>{m.label}</span>
                  <span style={{color:T.text}}>{m.val}</span>
                </div>
              ))}
            </div>
            <button className="mp-btn mp-btn-primary" style={{padding:"12px"}}
              onClick={()=>{onAddToCart(p);onClose();}}>
              {inCart?<><Check size={14}/> In Cart</>:<><ShoppingCart size={14}/> Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart Drawer ────────────────────────────────────────────────────────────────
function CartDrawer({ cart, onRemove, onBuy, onClose, buying }) {
  const total = cart.reduce((s,p)=>s+(p.isFree?0:p.price),0);
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}} onClick={onClose}>
      <div style={{flex:1,background:"rgba(15,23,42,0.25)",backdropFilter:"blur(4px)"}}/>
      <div style={{width:360,background:T.surface,height:"100%",overflowY:"auto",
        padding:24,animation:"slideIn 0.22s ease both",
        boxShadow:"-4px 0 40px rgba(0,0,0,0.12)",borderLeft:`1px solid ${T.border}`}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>Your Cart</div>
          <button onClick={onClose} style={{background:T.surface2,border:`1px solid ${T.border}`,
            borderRadius:8,width:32,height:32,cursor:"pointer",color:T.textMid,
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={14}/>
          </button>
        </div>
        {cart.length===0?(
          <div style={{textAlign:"center",padding:60,color:T.textFaint}}>
            <ShoppingCart size={40} style={{opacity:0.2,margin:"0 auto 12px"}}/>
            <p style={{fontSize:13}}>Cart is empty</p>
          </div>
        ):(<>
          {cart.map(p=>(
            <div key={p._id} style={{display:"flex",gap:12,padding:"14px 0",
              borderBottom:`1px solid ${T.border2}`,alignItems:"center"}}>
              <div style={{width:52,height:52,borderRadius:10,overflow:"hidden",
                background:T.surface2,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {imgSrc(p.images?.[0])
                  ?<img src={imgSrc(p.images[0])} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""
                      onError={e=>e.target.style.display="none"}/>
                  :<Package size={20} style={{opacity:0.25,color:T.textFaint}}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:3,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>
                  {p.title}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:p.isFree?T.primary:T.text,
                  fontFamily:"'JetBrains Mono',monospace"}}>{fmtLKR(p.price)}</div>
              </div>
              <button onClick={()=>onRemove(p._id)}
                style={{background:"none",border:"none",color:T.danger,cursor:"pointer",padding:4,display:"flex"}}>
                <X size={14}/>
              </button>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",
            padding:"16px 0",fontSize:15,fontWeight:700,
            borderBottom:`1px solid ${T.border}`,marginBottom:20}}>
            <span style={{color:T.textMid}}>Total</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace"}}>{fmtLKR(total)}</span>
          </div>
          <div style={{fontSize:10,fontWeight:700,color:T.textFaint,
            letterSpacing:"0.10em",textTransform:"uppercase",marginBottom:12}}>
            How would you like to buy?
          </div>
          <button className="mp-btn mp-btn-primary"
            style={{width:"100%",marginBottom:10,padding:"13px"}}
            disabled={!!buying} onClick={()=>onBuy("on_campus")}>
            {buying==="on_campus"
              ?<><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",
                  borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                Sending emails…</>
              :<><School size={15}/> Meet on Campus</>}
          </button>
          <button className="mp-btn mp-btn-outline"
            style={{width:"100%",padding:"13px"}}
            disabled={!!buying} onClick={()=>onBuy("pay_first")}>
            {buying==="pay_first"
              ?<><div style={{width:14,height:14,border:"2px solid rgba(99,102,241,0.4)",
                  borderTop:"2px solid #6366f1",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                Preparing…</>
              :<><CreditCard size={15}/> Pay First</>}
          </button>
          <div style={{marginTop:14,padding:"12px 14px",background:T.surface2,
            borderRadius:10,border:`1px solid ${T.border}`,fontSize:11,color:T.textFaint,lineHeight:1.7}}>
            <strong style={{color:T.textMid}}>🏫 Meet on Campus</strong> — emails sent to both parties.<br/>
            <strong style={{color:T.textMid}}>💳 Pay First</strong> — secure payment page with bank/wallet details.
          </div>
        </>)}
      </div>
    </div>
  );
}

// ── Add Listing Modal ──────────────────────────────────────────────────────────
function AddListingModal({ onClose, onSuccess }) {
  const [form,setForm]=useState({title:"",description:"",price:"",isFree:false,
    category:"Textbooks",faculty:"All",condition:"Good",paymentMethod:"both"});
  const [images,setImages]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    if(!form.title||!form.description){setError("Title and description required");return;}
    if(!form.isFree&&!form.price){setError("Enter a price or mark as free");return;}
    setLoading(true);setError("");
    try{
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      images.forEach(img=>fd.append("images",img));
      await axios.post(API,fd,{headers:{...authH(),"Content-Type":"multipart/form-data"}});
      onSuccess();onClose();
    }catch(e){setError(e.response?.data?.message||"Failed to create listing");}
    finally{setLoading(false);}
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",
      backdropFilter:"blur(6px)",zIndex:1000,display:"flex",alignItems:"center",
      justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:T.surface,borderRadius:20,padding:28,width:"100%",
        maxWidth:500,maxHeight:"90vh",overflowY:"auto",animation:"popIn 0.2s ease both",
        boxShadow:"0 24px 60px rgba(0,0,0,0.15)",border:`1px solid ${T.border}`}}
        onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22}}>List an Item</div>
          <button onClick={onClose} style={{background:T.surface2,border:`1px solid ${T.border}`,
            borderRadius:8,width:32,height:32,cursor:"pointer",display:"flex",
            alignItems:"center",justifyContent:"center",color:T.textMid}}><X size={14}/></button>
        </div>
        {error&&<div style={{background:T.dangerSoft,border:"1px solid #fca5a5",
          borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:T.danger}}>{error}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label className="mp-label">Title *</label>
            <input className="mp-input" placeholder="e.g. Data Structures by Cormen"
              value={form.title} onChange={e=>set("title",e.target.value)}/></div>
          <div><label className="mp-label">Description *</label>
            <textarea className="mp-input" style={{minHeight:80,resize:"vertical"}}
              placeholder="Condition, edition, reason for selling…"
              value={form.description} onChange={e=>set("description",e.target.value)}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="mp-label">Category</label>
              <select className="mp-input" value={form.category} onChange={e=>set("category",e.target.value)}>
                {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="mp-label">Faculty</label>
              <select className="mp-input" value={form.faculty} onChange={e=>set("faculty",e.target.value)}>
                {FACULTIES.map(f=><option key={f}>{f}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label className="mp-label">Condition</label>
              <select className="mp-input" value={form.condition} onChange={e=>set("condition",e.target.value)}>
                {CONDITIONS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label className="mp-label">Price (LKR)</label>
              <input className="mp-input" type="number" placeholder="0" min="0"
                style={{opacity:form.isFree?0.35:1}} value={form.price}
                disabled={form.isFree} onChange={e=>set("price",e.target.value)}/></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",
            background:T.surface2,borderRadius:10,border:`1px solid ${T.border}`,cursor:"pointer"}}
            onClick={()=>set("isFree",!form.isFree)}>
            <div style={{width:20,height:20,borderRadius:6,flexShrink:0,
              background:form.isFree?T.primary:"transparent",
              border:`2px solid ${form.isFree?T.primary:T.textFaint}`,
              display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
              {form.isFree&&<Check size={12} color="white" strokeWidth={3}/>}
            </div>
            <span style={{fontSize:13}}>This is a <strong style={{color:T.primary}}>FREE giveaway</strong></span>
          </div>
          {!form.isFree&&<div><label className="mp-label">Payment method</label>
            <select className="mp-input" value={form.paymentMethod} onChange={e=>set("paymentMethod",e.target.value)}>
              <option value="both">Both options</option>
              <option value="on_campus">On Campus only</option>
              <option value="pay_first">Pay First only</option>
            </select></div>}
          <div><label className="mp-label">Photos (up to 4)</label>
            <div style={{border:`2px dashed ${T.border}`,borderRadius:10,padding:16,
              textAlign:"center",background:T.surface2,position:"relative",cursor:"pointer"}}>
              <input type="file" multiple accept="image/*"
                onChange={e=>setImages([...e.target.files].slice(0,4))}
                style={{position:"absolute",inset:0,opacity:0,cursor:"pointer"}}/>
              <Package size={20} style={{color:T.textFaint,margin:"0 auto 6px"}}/>
              <div style={{fontSize:12,color:T.textFaint}}>
                {images.length>0?`${images.length} photo(s) selected`:"Click to upload photos"}
              </div>
            </div>
            {images.length>0&&<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
              {[...images].map((img,i)=>(
                <img key={i} src={URL.createObjectURL(img)}
                  style={{width:60,height:60,objectFit:"cover",borderRadius:8,
                    border:`1px solid ${T.border}`}} alt=""/>
              ))}</div>}
          </div>
        </div>
        <button className="mp-btn mp-btn-primary" style={{width:"100%",marginTop:22,padding:"13px",fontSize:14}}
          onClick={submit} disabled={loading}>
          {loading?"Listing…":<><Package size={15}/> List Item</>}
        </button>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ product:p, onCardClick, onAddToCart, onToggleFav, isFav, inCart }) {
  return (
    <div className="mp-card" style={{cursor:"pointer"}} onClick={()=>onCardClick(p)}>
      <div style={{height:175,background:T.surface2,position:"relative",overflow:"hidden"}}>
        {imgSrc(p.images?.[0])
          ?<img src={imgSrc(p.images[0])} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.title}
              onError={e=>e.target.style.display="none"}/>
          :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
              justifyContent:"center",flexDirection:"column",gap:8,color:T.textFaint}}>
              <Package size={36} style={{opacity:0.2}}/>
              <span style={{fontSize:11}}>No photo</span>
            </div>}
        {p.isFree&&<div style={{position:"absolute",top:10,left:10,background:T.primary,
          color:"white",borderRadius:7,padding:"3px 10px",fontSize:10,fontWeight:700}}>FREE</div>}
        <div style={{position:"absolute",top:10,right:10,background:"rgba(255,255,255,0.92)",
          backdropFilter:"blur(4px)",color:T.textMid,borderRadius:6,
          padding:"3px 8px",fontSize:10,fontWeight:600,border:`1px solid ${T.border}`}}>
          {p.condition}
        </div>
        <button className={`fav-btn ${isFav?"active":""}`}
          onClick={e=>{e.stopPropagation();onToggleFav(p._id);}}>
          <Heart size={15} fill={isFav?"#ef4444":"none"} stroke={isFav?"#ef4444":T.textFaint}/>
        </button>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6,
          overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
          WebkitLineClamp:2,WebkitBoxOrient:"vertical",lineHeight:1.4,minHeight:38}}>
          {p.title}
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
          <span style={{background:T.primarySoft,color:T.primary,
            borderRadius:999,padding:"2px 9px",fontSize:10,fontWeight:600}}>{p.category}</span>
          <span style={{background:T.tealSoft,color:T.teal,
            borderRadius:999,padding:"2px 9px",fontSize:10,fontWeight:600}}>{p.faculty}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontSize:16,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",
            color:p.isFree?T.primary:T.text}}>{fmtLKR(p.price)}</div>
          <div style={{fontSize:11,color:T.textFaint,display:"flex",alignItems:"center",gap:3}}>
            <Eye size={11}/>{p.viewCount||0}
          </div>
        </div>
        <div style={{fontSize:11,color:T.textFaint,marginBottom:12}}>
          by {p.seller?.fullname||"Unknown"}
        </div>
        <button className="mp-btn" onClick={e=>{e.stopPropagation();!inCart&&onAddToCart(p);}}
          style={{width:"100%",padding:"9px",borderRadius:10,fontSize:12,
            background:inCart?T.primarySoft:"#f0fdf4",color:inCart?T.primaryDark:T.primary,
            border:`1.5px solid ${inCart?T.primary+"60":T.primary+"30"}`,
            cursor:inCart?"default":"pointer",fontWeight:600}}>
          {inCart?<><Check size={13}/> In Cart</>:<><ShoppingCart size={13}/> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Marketplace() {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("browse");
  const [cart,        setCart]        = useState([]);
  const [cartOpen,    setCartOpen]    = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [favourites,  setFavourites]  = useState([]);
  const [myListings,  setMyListings]  = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const [faculty,     setFaculty]     = useState("All");
  const [category,    setCategory]    = useState("All");
  const [search,      setSearch]      = useState("");
  const [notif,       setNotif]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [buying,      setBuying]      = useState(null);

  const cartIds = cart.map(p=>p._id);
  const favIds  = favourites.map(p=>typeof p==="string"?p:p._id).filter(Boolean);

  const showNotif=(msg,type="success")=>{setNotif({msg,type});setTimeout(()=>setNotif(null),4000);};

  const loadProducts=useCallback(async()=>{
    setLoading(true);
    try{
      const p=new URLSearchParams();
      if(faculty!=="All")  p.append("faculty",faculty);
      if(category!=="All") p.append("category",category);
      if(tab==="free")     p.append("isFree","true");
      if(search)           p.append("search",search);
      const{data}=await axios.get(`${API}?${p}`);
      setProducts(data.data||[]);
    }catch{setProducts([]);}
    finally{setLoading(false);}
  },[faculty,category,tab,search]);

  const loadProfileData=useCallback(async()=>{
    if(!getToken())return;
    try{
      const[fR,lR,pR]=await Promise.all([
        axios.get(`${API}/user/favourites`,  {headers:authH()}),
        axios.get(`${API}/user/my-listings`, {headers:authH()}),
        axios.get(`${API}/user/purchases`,   {headers:authH()}),
      ]);
      setFavourites(fR.data.data||[]);
      setMyListings(lR.data.data||[]);
      setMyPurchases(pR.data.data||[]);
    }catch{}
  },[]);

  useEffect(()=>{loadProducts();},[loadProducts]);
  useEffect(()=>{loadProfileData();},[loadProfileData]);

  const addToCart=(product)=>{
    if(cartIds.includes(product._id))return;
    setCart(c=>[...c,product]);showNotif("Added to cart");
  };

  const handleBuy=async(method)=>{
    if(!getToken()){navigate("/login");return;}
    setBuying(method);
    try{
      let lastOrder=null;
      for(const p of cart){
        const res=await axios.post(`${API}/${p._id}/buy`,{purchaseMethod:method},{headers:authH()});
        if(method==="pay_first"&&res.data.order) lastOrder=res.data.order;
      }
      setCart([]);setCartOpen(false);
      loadProfileData();

      if(method==="on_campus"){
        showNotif("✅ Reserved! Emails sent to you and the seller.");
      } else if(method==="pay_first"&&lastOrder){
        // Navigate to payment page with order data
        navigate("/marketplace/payment",{state:{order:lastOrder}});
      }
    }catch(e){
      showNotif(e.response?.data?.message||"Purchase failed","error");
    }finally{setBuying(null);}
  };

  const toggleFav=async(id)=>{
    if(!getToken()){navigate("/login");return;}
    // Optimistic
    setFavourites(prev=>{
      const ids=prev.map(p=>typeof p==="string"?p:p._id);
      if(ids.includes(id)) return prev.filter(p=>(typeof p==="string"?p:p._id)!==id);
      return [...prev,{_id:id}];
    });
    try{
      await axios.post(`${API}/${id}/favourite`,{},{headers:authH()});
      loadProfileData();
    }catch{}
  };

  const deleteListing=async(id)=>{
    if(!window.confirm("Delete this listing?"))return;
    try{
      await axios.delete(`${API}/${id}`,{headers:authH()});
      loadProfileData();loadProducts();showNotif("Listing deleted");
    }catch{showNotif("Failed to delete","error");}
  };

  const displayProducts=
    tab==="browse"||tab==="free"?products:
    tab==="favourites"?favourites:
    tab==="my-listings"?myListings:myPurchases;

  return(<>
    <style>{CSS}</style>
    {notif&&(
      <div style={{position:"fixed",top:20,right:20,zIndex:9999,
        background:notif.type==="error"?T.dangerSoft:"#f0fdf4",
        border:`1px solid ${notif.type==="error"?"#fca5a5":"#86efac"}`,
        borderRadius:10,padding:"11px 18px",fontSize:13,fontWeight:600,
        color:notif.type==="error"?T.danger:T.primaryDark,
        boxShadow:"0 4px 16px rgba(0,0,0,0.08)",animation:"popIn 0.2s ease both",
        display:"flex",alignItems:"center",gap:8,maxWidth:380}}>
        {notif.type==="error"?<X size={14}/>:<Check size={14}/>}
        {notif.msg}
      </div>
    )}

    {selected&&<ProductModal product={selected} onClose={()=>setSelected(null)}
      onAddToCart={addToCart} onToggleFav={toggleFav}
      isFav={favIds.includes(selected._id)} inCart={cartIds.includes(selected._id)}/>}

    {cartOpen&&<CartDrawer cart={cart}
      onRemove={id=>setCart(c=>c.filter(p=>p._id!==id))}
      onBuy={handleBuy} onClose={()=>setCartOpen(false)} buying={buying}/>}

    {showAdd&&<AddListingModal onClose={()=>setShowAdd(false)}
      onSuccess={()=>{loadProducts();loadProfileData();showNotif("Listing created!");}}/>}

    <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 20px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",
        alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:14}}>
        <div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:32,marginBottom:6}}>
            Campus Marketplace
          </h1>
          <p style={{fontSize:13,color:T.textFaint}}>
            Buy, sell and give away textbooks, equipment and more — sustainably.
          </p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button className="mp-btn mp-btn-ghost" onClick={()=>setCartOpen(true)}
            style={{position:"relative",padding:"10px 16px",gap:7}}>
            <ShoppingCart size={15}/> Cart
            {cart.length>0&&<span style={{position:"absolute",top:-6,right:-6,
              background:T.danger,color:"white",borderRadius:"50%",
              width:18,height:18,fontSize:10,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {cart.length}</span>}
          </button>
          <button className="mp-btn mp-btn-primary" onClick={()=>setShowAdd(true)}>
            <Plus size={15}/> List Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,marginBottom:24,overflowX:"auto"}}>
        {[
          {id:"browse",     icon:<Layers size={13}/>,     label:"Browse"},
          {id:"free",       icon:<Gift size={13}/>,        label:"Free"},
          {id:"favourites", icon:<Heart size={13}/>,       label:`Saved (${favourites.length})`},
          {id:"my-listings",icon:<Package size={13}/>,     label:`My Listings (${myListings.length})`},
          {id:"purchases",  icon:<CreditCard size={13}/>,  label:`Purchases (${myPurchases.length})`},
        ].map(t=>(
          <button key={t.id} className={`mp-tab ${tab===t.id?"on":""}`}
            onClick={()=>setTab(t.id)}>{t.icon}{t.label}</button>
        ))}
      </div>

      {/* Filters */}
      {(tab==="browse"||tab==="free")&&(
        <div style={{marginBottom:22}}>
          <input className="mp-input" style={{marginBottom:12}}
            placeholder="Search textbooks, equipment, furniture…"
            value={search} onChange={e=>setSearch(e.target.value)}/>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:8,marginBottom:8}}>
            {FACULTIES.map(f=>(
              <button key={f} className={`mp-chip ${faculty===f?"on":""}`}
                onClick={()=>setFaculty(f)}>{f}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
            {CATEGORIES.map(c=>(
              <button key={c} className={`mp-chip ${category===c?"on":""}`}
                onClick={()=>setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {/* My Listings — with buyer info when reserved */}
      {tab==="my-listings"&&(
        myListings.length===0
          ?<div style={{textAlign:"center",padding:60,color:T.textFaint}}>
              <Package size={40} style={{opacity:0.2,margin:"0 auto 12px"}}/>
              <p style={{fontSize:13,marginBottom:16}}>No listings yet.</p>
              <button className="mp-btn mp-btn-primary" onClick={()=>setShowAdd(true)}>
                <Plus size={14}/> List Your First Item
              </button>
            </div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:16}}>
              {myListings.map(p=>(
                <div key={p._id} className="mp-card">
                  <div style={{height:150,background:T.surface2,position:"relative",overflow:"hidden"}}>
                    {imgSrc(p.images?.[0])
                      ?<img src={imgSrc(p.images[0])} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""
                          onError={e=>e.target.style.display="none"}/>
                      :<div style={{width:"100%",height:"100%",display:"flex",
                          alignItems:"center",justifyContent:"center"}}>
                          <Package size={32} style={{opacity:0.2,color:T.textFaint}}/></div>}
                    <div style={{position:"absolute",top:10,right:10,
                      background:p.status==="sold"?"#64748b":p.status==="reserved"?T.amber:T.primary,
                      color:"white",borderRadius:6,padding:"3px 9px",
                      fontSize:10,fontWeight:700,textTransform:"uppercase"}}>{p.status}</div>
                    {p.favouritedBy?.length>0&&(
                      <div style={{position:"absolute",top:10,left:10,
                        background:"rgba(244,63,94,0.9)",color:"white",borderRadius:6,
                        padding:"3px 9px",fontSize:10,fontWeight:700,
                        display:"flex",alignItems:"center",gap:4}}>
                        <Heart size={9} fill="white" stroke="none"/>
                        {p.favouritedBy.length}
                      </div>
                    )}
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>{p.title}</div>
                    {/* Buyer info — only when reserved */}
                    {p.status==="reserved"&&p.buyer&&(
                      <div style={{background:T.amberSoft,border:"1px solid #fde68a",
                        borderRadius:8,padding:"10px 12px",marginBottom:10,fontSize:12}}>
                        <div style={{fontWeight:700,color:T.amber,marginBottom:4,
                          display:"flex",alignItems:"center",gap:5}}>
                          <Bell size={11}/> Buyer Info
                        </div>
                        <div style={{color:T.textMid}}>{p.buyer?.fullname||"Unknown"}</div>
                        <div style={{color:T.textFaint,fontSize:11}}>{p.buyer?.email}</div>
                        <div style={{color:T.textFaint,fontSize:11,marginTop:2}}>
                          {p.purchaseMethod==="on_campus"?"🏫 Meeting on campus":"💳 Paid via bank/wallet"}
                        </div>
                      </div>
                    )}
                    <div style={{display:"flex",gap:14,fontSize:11,color:T.textMid,marginBottom:14}}>
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <Eye size={11}/>{p.viewCount||0}
                      </span>
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <Heart size={11}/>{p.favouritedBy?.length||0} saves
                      </span>
                      <span style={{color:T.primary,fontWeight:700,
                        fontFamily:"'JetBrains Mono',monospace"}}>{fmtLKR(p.price)}</span>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {p.status==="reserved"&&(
                        <button className="mp-btn mp-btn-primary" style={{flex:1,padding:"8px",fontSize:12}}
                          onClick={async()=>{
                            await axios.post(`${API}/${p._id}/sold`,{},{headers:authH()});
                            loadProfileData();showNotif("Marked as sold!");
                          }}>
                          <Check size={12}/> Mark Sold
                        </button>
                      )}
                      <button className="mp-btn" onClick={()=>deleteListing(p._id)}
                        style={{flex:1,padding:"8px",borderRadius:8,
                          border:"1px solid #fca5a5",background:T.dangerSoft,
                          color:T.danger,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Purchases */}
      {tab==="purchases"&&(
        myPurchases.length===0
          ?<div style={{textAlign:"center",padding:60,color:T.textFaint}}>
              <CreditCard size={40} style={{opacity:0.2,margin:"0 auto 12px"}}/>
              <p style={{fontSize:13}}>No purchases yet.</p>
            </div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
              {myPurchases.map(p=>(
                <div key={p._id} style={{background:T.surface,border:`1px solid ${T.border}`,
                  borderRadius:14,padding:"16px 20px",display:"flex",
                  justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <div style={{width:52,height:52,borderRadius:10,background:T.surface2,
                      overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {imgSrc(p.images?.[0])
                        ?<img src={imgSrc(p.images[0])} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""
                            onError={e=>e.target.style.display="none"}/>
                        :<Package size={20} style={{opacity:0.25,color:T.textFaint}}/>}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{p.title}</div>
                      <div style={{fontSize:11,color:T.textMid,marginTop:2}}>
                        Seller: {p.seller?.fullname} · {p.seller?.email}
                      </div>
                      <div style={{fontSize:11,color:T.textFaint,marginTop:1,
                        display:"flex",alignItems:"center",gap:4}}>
                        {p.purchaseMethod==="on_campus"
                          ?<><School size={11}/> Meet on campus</>
                          :<><CreditCard size={11}/> Paid via bank/wallet</>}
                        {" · "}{new Date(p.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:15,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>
                      {fmtLKR(p.price)}
                    </div>
                    <div style={{fontSize:10,marginTop:3,fontWeight:600,textTransform:"uppercase",
                      color:p.status==="sold"?T.primary:T.amber}}>{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
      )}

      {/* Product grid */}
      {(tab==="browse"||tab==="free"||tab==="favourites")&&(
        loading
          ?<div style={{textAlign:"center",padding:80}}>
              <div style={{width:30,height:30,border:`3px solid ${T.border}`,
                borderTop:`3px solid ${T.primary}`,borderRadius:"50%",
                animation:"spin 0.7s linear infinite",margin:"0 auto 12px"}}/>
              <p style={{color:T.textFaint,fontSize:13}}>Loading marketplace…</p>
            </div>
          :displayProducts.length===0
            ?<div style={{textAlign:"center",padding:80,color:T.textFaint}}>
                <div style={{margin:"0 auto 16px",opacity:0.2}}>
                  {tab==="free"?<Gift size={48}/>:tab==="favourites"?<Heart size={48}/>:<Package size={48}/>}
                </div>
                <p style={{fontSize:14,marginBottom:8}}>
                  {tab==="free"?"No free items right now."
                  :tab==="favourites"?"No saved items yet — heart items you like!"
                  :"No items found. Try adjusting your filters."}
                </p>
              </div>
            :<div style={{display:"grid",
                gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:18}}>
                {displayProducts.map(p=>(
                  <ProductCard key={p._id} product={p}
                    onCardClick={setSelected}
                    onAddToCart={addToCart} onToggleFav={toggleFav}
                    isFav={favIds.includes(p._id)} inCart={cartIds.includes(p._id)}/>
                ))}
              </div>
      )}
    </div>
  </>);
}