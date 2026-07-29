import { useState } from "react";
import { Mail, Lock, Check } from "lucide-react";
import { supabaseConfigured } from "../lib/supabaseClient";

export default function AuthGate({ auth }) {
  const [mode, setMode] = useState("magic"); // 'magic' | 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (!supabaseConfigured) {
    return (
      <div className="mp-auth-wrap">
        <div className="mp-index-card mp-auth-card">
          <div className="mp-auth-brand">
            <span className="mp-brand-mark" />
            The Meal Box
          </div>
          <div className="mp-auth-error">
            Supabase isn't configured yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment (see{" "}
            <code>.env.example</code>) to enable sign-in and cross-device sync.
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "magic") {
        await auth.sendMagicLink(email.trim());
        setSent(true);
      } else if (mode === "signup") {
        await auth.signUpWithPassword(email.trim(), password);
        setSent(true);
      } else {
        await auth.signInWithPassword(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mp-auth-wrap">
      <div className="mp-index-card mp-auth-card">
        <div className="mp-auth-brand">
          <span className="mp-brand-mark" />
          The Meal Box
        </div>
        <p className="mp-auth-sub">
          Sign in to keep your meal plans, recipes, and shopping lists in sync across every
          device.
        </p>

        {error && <div className="mp-auth-error">{error}</div>}
        {sent && mode === "magic" && (
          <div className="mp-auth-success">
            <Check size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
            Check {email} for a sign-in link.
          </div>
        )}
        {sent && mode === "signup" && (
          <div className="mp-auth-success">
            <Check size={13} style={{ verticalAlign: -2, marginRight: 4 }} />
            Almost there — confirm your address from the email we just sent.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mp-label">Email</label>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <Mail
              size={15}
              style={{ position: "absolute", left: 11, top: 11, color: "var(--ink-faint)" }}
            />
            <input
              className="mp-input"
              style={{ paddingLeft: 32 }}
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {mode !== "magic" && (
            <>
              <label className="mp-label">Password</label>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Lock
                  size={15}
                  style={{ position: "absolute", left: 11, top: 11, color: "var(--ink-faint)" }}
                />
                <input
                  className="mp-input"
                  style={{ paddingLeft: 32 }}
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          <button
            className="mp-btn mp-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Please wait…"
              : mode === "magic"
                ? "Send sign-in link"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        <div className="mp-auth-toggle">
          {mode === "magic" && (
            <>
              <span>Prefer a password?</span>
              <button className="mp-link-btn" onClick={() => { setMode("signin"); setError(""); setSent(false); }}>
                Sign in with password
              </button>
            </>
          )}
          {mode !== "magic" && (
            <>
              <button className="mp-link-btn" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSent(false); }}>
                {mode === "signin" ? "Create an account" : "Have an account? Sign in"}
              </button>
              <span>·</span>
              <button className="mp-link-btn" onClick={() => { setMode("magic"); setError(""); setSent(false); }}>
                Use a magic link
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
