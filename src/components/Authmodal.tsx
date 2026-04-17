import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "register";
type Role = "customer" | "provider";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia",
  "Austria","Bangladesh","Belgium","Bolivia","Brazil","Cambodia","Cameroon",
  "Canada","Chile","China","Colombia","Costa Rica","Croatia","Czech Republic",
  "Denmark","DR Congo","Ecuador","Egypt","Ethiopia","Finland","France",
  "Germany","Ghana","Greece","Hungary","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Japan","Jordan","Kenya","Kuwait","Latvia",
  "Lebanon","Lithuania","Malaysia","Mexico","Morocco","Mozambique","Myanmar",
  "Namibia","Nepal","Netherlands","New Zealand","Nigeria","Norway","Oman",
  "Pakistan","Panama","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saudi Arabia","Senegal","Singapore","Slovakia",
  "Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signUpCustomer, signUpProvider, signIn } = useAuth();

  const [mode, setMode]   = useState<Mode>("login");
  const [role, setRole]   = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", country: "",
  });
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Photo must be under 3 MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  // Upload avatar to Supabase Storage (bucket: avatars)
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    const ext  = avatarFile.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });
    if (error) { console.warn("Avatar upload failed:", error.message); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setGoogleLoading(true); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setGoogleLoading(false); }
    // On success Supabase redirects the browser — no further action needed here
  };

  // ── Email submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(""); setSuccess("");

    // Validation
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (mode === "register") {
      if (!form.name) { setError("Full name is required."); return; }
      if (!form.country) { setError("Please select your country."); return; }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        // Sign up
        let userId: string | null = null;
        if (role === "customer") {
          const result = await signUpCustomer({
            name: form.name, email: form.email, password: form.password,
            phone: form.phone, city: form.country, county: form.country,
          });
          userId = (result as { id?: string })?.id ?? null;
        } else {
          const result = await signUpProvider({
            name: form.name, email: form.email, password: form.password,
            phone: form.phone, city: form.country, county: form.country,
            businessName: form.name, category: "General", description: "",
            subServices: [], counties: [form.country], basePrice: 0, priceUnit: "job",
          });
          userId = (result as { id?: string })?.id ?? null;
        }
        // Upload avatar if chosen
        if (userId && avatarFile) await uploadAvatar(userId);

        setSuccess("Account created! Check your email to verify, then sign in.");
        setTimeout(() => { setMode("login"); setSuccess(""); }, 3000);
      } else {
        // Sign in
        await signIn(form.email, form.password);
        onClose();
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : "Something went wrong.";
      if (m.includes("rate") || m.includes("429"))
        setError("Too many attempts — please wait a minute and try again.");
      else if (m.includes("Invalid login") || m.includes("invalid_credentials"))
        setError("Incorrect email or password.");
      else if (m.includes("already registered") || m.includes("already been registered"))
        setError("An account with this email already exists. Sign in instead.");
      else setError(m);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const dark = {
    bg: "#1e293b", surface: "#0f172a", text: "#e2e8f0", muted: "#94a3b8",
    border: "#334155", accent: "#0ea5e9",
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1px solid ${dark.border}`, background: dark.surface,
    color: dark.text, fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  const btn = (variant: "primary"|"secondary"|"google"): React.CSSProperties => ({
    width: "100%", padding: "11px", borderRadius: 10, border: "none",
    background: variant === "primary" ? dark.accent
               : variant === "google" ? "#ffffff"
               : "transparent",
    color: variant === "google" ? "#1f2937" : "#fff",
    fontSize: 14, fontWeight: 600, cursor: loading || googleLoading ? "not-allowed" : "pointer",
    opacity: loading && variant === "primary" ? 0.7 : 1,
    border: variant === "secondary" ? `1px solid ${dark.border}` : "none",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  });

  return (
    <div style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}>
      <div style={{ background:dark.bg, border:`1px solid ${dark.border}`, borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:420, position:"relative", display:"flex", flexDirection:"column", gap:14 }}
        onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", color:dark.muted, fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:4 }}>
          <div style={{ fontSize:22, fontWeight:800, color:dark.accent, marginBottom:4 }}>Q-LINK</div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:dark.text }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={{ margin:"4px 0 0", fontSize:13, color:dark.muted }}>
            {mode === "login" ? "Sign in to continue" : "Join thousands of users on Q-LINK"}
          </p>
        </div>

        {/* Mode tabs */}
        <div style={{ display:"flex", background:dark.surface, borderRadius:10, padding:4 }}>
          {(["login","register"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              style={{ flex:1, padding:"8px", borderRadius:8, border:"none", background: mode===m ? dark.accent : "transparent", color: mode===m ? "#fff" : dark.muted, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Role toggle (register only) */}
        {mode === "register" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {(["customer","provider"] as Role[]).map(r => (
              <button key={r} onClick={() => setRole(r)}
                style={{ padding:10, borderRadius:10, border: role===r ? `2px solid ${dark.accent}` : `1px solid ${dark.border}`, background: role===r ? "rgba(14,165,233,0.15)" : "transparent", color: dark.text, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                {r === "customer" ? "👤 Customer" : "💼 Provider"}
              </button>
            ))}
          </div>
        )}

        {/* Google button */}
        <button onClick={handleGoogle} disabled={googleLoading} style={btn("google")}>
          {/* Google SVG logo */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.5z"/>
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.9 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.9 14.8 48 24 48z"/>
            <path fill="#FBBC04" d="M10.8 28.8c-.5-1.4-.8-2.8-.8-4.3s.3-2.9.8-4.3v-6.2H2.7C1 17.2 0 20.5 0 24s1 6.8 2.7 9.9l8.1-5.1z"/>
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.5 30.4 0 24 0 14.8 0 6.7 5.1 2.7 12.6l8.1 5.1C12.7 13.6 17.9 9.5 24 9.5z"/>
          </svg>
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1, height:1, background:dark.border }} />
          <span style={{ fontSize:12, color:dark.muted }}>or</span>
          <div style={{ flex:1, height:1, background:dark.border }} />
        </div>

        {/* Avatar picker (register only) */}
        {mode === "register" && (
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div onClick={() => fileInputRef.current?.click()}
              style={{ width:56, height:56, borderRadius:"50%", border:`2px dashed ${dark.border}`, background:dark.surface, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden", flexShrink:0 }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                : <span style={{ fontSize:22 }}>📷</span>
              }
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:dark.text }}>Profile photo</div>
              <button onClick={() => fileInputRef.current?.click()} style={{ background:"none", border:"none", color:dark.accent, fontSize:12, cursor:"pointer", padding:0 }}>
                {avatarPreview ? "Change photo" : "Upload photo (optional)"}
              </button>
              <div style={{ fontSize:11, color:dark.muted }}>Max 3 MB · JPG or PNG</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:"none" }} onChange={handleAvatarChange} />
          </div>
        )}

        {/* Form fields */}
        {mode === "register" && (
          <input name="name" placeholder="Full name *" value={form.name} onChange={handleChange} style={inp} />
        )}
        <input name="email" type="email" placeholder="Email address *" value={form.email} onChange={handleChange} style={inp} />
        {mode === "register" && (
          <input name="phone" type="tel" placeholder="Phone number (optional)" value={form.phone} onChange={handleChange} style={inp} />
        )}
        <input name="password" type="password" placeholder={`Password${mode==="register" ? " (min. 8 characters) *" : " *"}`} value={form.password} onChange={handleChange}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={inp} />
        {mode === "register" && (
          <select name="country" value={form.country} onChange={handleChange}
            style={{ ...inp, color: form.country ? dark.text : dark.muted }}>
            <option value="">Select your country *</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Feedback */}
        {error   && <div style={{ background:"#fef2f2", color:"#dc2626", padding:"10px 12px", borderRadius:8, fontSize:13, border:"1px solid #fecaca" }}>{error}</div>}
        {success && <div style={{ background:"#f0fdf4", color:"#16a34a", padding:"10px 12px", borderRadius:8, fontSize:13, border:"1px solid #bbf7d0" }}>{success}</div>}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading} style={btn("primary")}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {/* Switch mode link */}
        <p style={{ textAlign:"center", fontSize:13, color:dark.muted, margin:0 }}>
          {mode === "login" ? "No account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode==="login"?"register":"login"); setError(""); setSuccess(""); }}
            style={{ background:"none", border:"none", color:dark.accent, cursor:"pointer", fontSize:13, fontWeight:600 }}>
            {mode === "login" ? "Sign up free" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}