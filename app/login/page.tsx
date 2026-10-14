"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ---------- Inline icons (no package needed) ---------- */
const Icon = ({
  d,
  size = 16,
  extra,
}: {
  d: string;
  size?: number;
  extra?: React.ReactNode;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
    {extra}
  </svg>
);

const IconHexagon = () => (
  <Icon d="M19.875 6.27a2.225 2.225 0 0 1 1.125 1.948v7.284c0 .809-.443 1.555-1.158 1.948l-6.75 4.27a2.269 2.269 0 0 1-2.184 0l-6.75-4.27A2.225 2.225 0 0 1 3 15.502V8.218c0-.809.443-1.555 1.158-1.948l6.75-3.97a2.33 2.33 0 0 1 2.25 0l6.75 3.97h-.033z" />
);
const IconChart = () => (
  <Icon d="M3 13a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM10 5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1zM17 9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1z" />
);
const IconBell = () => (
  <Icon d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3H4a4 4 0 0 0 2-3v-3a7 7 0 0 1 4-6M9 17v1a3 3 0 0 0 6 0v-1" />
);
const IconFile = () => (
  <Icon d="M14 3v4a1 1 0 0 0 1 1h4M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2M9 9h1M9 13h6M9 17h6" />
);
const IconMail = () => (
  <Icon d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 7l9 6l9-6" />
);
const IconLock = () => (
  <Icon d="M5 13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM11 16a1 1 0 1 0 2 0a1 1 0 0 0-2 0M8 11V7a4 4 0 1 1 8 0v4" />
);
const IconEye = () => (
  <Icon d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6" />
);
const IconEyeOff = () => (
  <Icon d="M10.585 10.587a2 2 0 0 0 2.829 2.828M16.681 16.673A8.7 8.7 0 0 1 12 18c-3.6 0-6.6-2-9-6c1.272-2.12 2.712-3.678 4.32-4.674m2.86-1.146A9 9 0 0 1 12 6c3.6 0 6.6 2 9 6c-.666 1.11-1.379 2.067-2.138 2.87M3 3l18 18" />
);
const IconLogin = () => (
  <Icon d="M14 8V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-2M21 12H9M18 15l3-3l-3-3" />
);
const IconAlert = () => (
  <Icon d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0M12 8v4M12 16h.01" />
);

const DEMO_ACCOUNT = {
  email: "admin@stockflow.com",
  password: "admin123",
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    if (email !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) {
      setError(true);
      return;
    }

    setError(false);
    router.push("/dashboard");
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="split">
        {/* ---------- Left: navy panel ---------- */}
        <div className="panel-left">
          <div className="orb" />

          <div className="brand">
            <div className="brand-mark">
              <IconHexagon />
            </div>
            <div>
              <span className="brand-name">StockFlow</span>
              <span className="brand-tag">IMS · CORE</span>
            </div>
          </div>

          <div className="panel-mid">
            <h1>Manage your inventory with confidence.</h1>
            <p>
              One dashboard for stock levels, movement, and reporting — built to
              stay accurate as your catalog grows.
            </p>

            <div className="feature-row">
              <div className="icon-chip">
                <IconChart />
              </div>
              <span>Real-time stock tracking</span>
            </div>
            <div className="feature-row">
              <div className="icon-chip">
                <IconBell />
              </div>
              <span>Automated low-stock alerts</span>
            </div>
            <div className="feature-row">
              <div className="icon-chip">
                <IconFile />
              </div>
              <span>Exportable reports</span>
            </div>
          </div>

          <div className="panel-foot">
            <div className="sb-pulse">
              <span className="pulse-dot" /> All systems nominal
            </div>
            <div className="version-tag">v2.4.0 · secure access</div>
          </div>
        </div>

        {/* ---------- Right: white panel ---------- */}
        <div className="panel-right">
          <div className="form-wrap">
            <div className="card">
              <h2>Welcome back</h2>
              <p className="sub">Sign in to access your dashboard</p>

              {error && (
                <div className="error-msg show">
                  <IconAlert /> Invalid email or password
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <div className="input-wrap">
                    <span className="lead-icon">
                      <IconMail />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <span className="lead-icon">
                      <IconLock />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-eye"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <div className="row-between">
                  <label className="remember">
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#">Forgot password?</a>
                </div>

                <button type="submit" className="primary">
                  <IconLogin /> Sign in
                </button>
              </form>
            </div>
            <p className="foot-note">
              StockFlow v2.4.0 · Access is logged for security
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Styles ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

.split {
  --sb-bg-1:#0A1226; --sb-bg-2:#0F1C3F; --sb-border:rgba(255,255,255,0.07); --sb-text:#8CA0CE;
  --page-bg:#F3F5FA; --card-bg:#FFFFFF; --border:#E6E9F2;
  --text-primary:#1B2340; --text-secondary:#69759A; --text-muted:#98A2C0;
  --blue:#3E6BF0; --blue-dark:#2A52D6;
  --success:#1DAA6B; --danger:#E5484D; --danger-light:#FDEBEC;
  --font-display:'Space Grotesk',sans-serif;
  --font-body:'Inter',-apple-system,'Segoe UI',sans-serif;
  --font-mono:'JetBrains Mono',ui-monospace,monospace;

  display:flex; min-height:100vh;
  font-family:var(--font-body); color:var(--text-primary);
}
.split *{box-sizing:border-box;}

.panel-left{
  width:44%; min-width:400px; flex-shrink:0; position:relative; overflow:hidden;
  background:linear-gradient(180deg,var(--sb-bg-1),var(--sb-bg-2));
  padding:44px 46px; display:flex; flex-direction:column; justify-content:space-between;
  color:#fff;
}
.panel-left::before{
  content:""; position:absolute; inset:0; pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size:32px 32px;
  -webkit-mask-image:radial-gradient(ellipse 90% 65% at 20% 20%, black 10%, transparent 72%);
  mask-image:radial-gradient(ellipse 90% 65% at 20% 20%, black 10%, transparent 72%);
}
.orb{
  position:absolute; width:420px; height:420px; border-radius:50%;
  background:radial-gradient(circle,#3E6BF0,transparent 70%);
  opacity:0.35; filter:blur(90px); bottom:-160px; left:-120px;
  animation:drift 24s ease-in-out infinite;
}
@keyframes drift{0%,100%{transform:translate(0,0);}50%{transform:translate(25px,-25px);}}

.brand{display:flex; align-items:center; gap:10px; position:relative; z-index:1;}
.brand-mark{
  width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#5B8DFF,#3E6BF0); box-shadow:0 0 16px rgba(62,107,240,0.55);
  flex-shrink:0; color:#fff;
}
.brand-name{font-family:var(--font-display); font-weight:700; font-size:16px;}
.brand-tag{display:block; font-size:9px; color:#5C6C97; font-family:var(--font-mono); letter-spacing:1.4px; margin-top:1px;}

.panel-mid{position:relative; z-index:1;}
.panel-mid h1{font-family:var(--font-display); font-size:25px; font-weight:700; line-height:1.3; margin:0 0 12px; max-width:340px;}
.panel-mid p{font-size:12.5px; color:var(--sb-text); line-height:1.6; margin:0 0 28px; max-width:320px;}

.feature-row{display:flex; align-items:center; gap:12px; margin-bottom:14px;}
.feature-row .icon-chip{
  width:34px; height:34px; border-radius:10px; background:rgba(62,107,240,0.18);
  border:1px solid rgba(94,141,255,0.25); display:flex; align-items:center; justify-content:center;
  color:#8CB0FF; flex-shrink:0;
}
.feature-row span{font-size:12.5px; color:#C4D0EE;}

.panel-foot{position:relative; z-index:1;}
.sb-pulse{
  display:flex; align-items:center; gap:8px; font-size:10.5px; color:#7C8CB5;
  padding:9px 12px; border:1px solid var(--sb-border); border-radius:10px; width:fit-content;
}
.pulse-dot{
  width:6px; height:6px; border-radius:50%; background:var(--success);
  box-shadow:0 0 0 0 rgba(29,170,107,0.6); animation:pulse 2s infinite; flex-shrink:0;
}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(29,170,107,0.55);}70%{box-shadow:0 0 0 7px rgba(29,170,107,0);}100%{box-shadow:0 0 0 0 rgba(29,170,107,0);}}
.version-tag{font-family:var(--font-mono); font-size:9.5px; color:#4C5C87; margin-top:10px;}

.panel-right{flex:1; background:var(--page-bg); display:flex; align-items:center; justify-content:center; padding:24px;}
.form-wrap{width:100%; max-width:360px;}

.card{
  background:var(--card-bg); border:1px solid var(--border); border-radius:16px;
  padding:30px 28px; position:relative; overflow:hidden;
  box-shadow:0 8px 28px rgba(30,50,110,0.08);
}

.card h2{font-family:var(--font-display); font-size:19px; margin:0 0 4px; font-weight:700;}
.card p.sub{font-size:12px; color:var(--text-secondary); margin:0 0 24px;}

.field{margin-bottom:14px;}
.field label{display:block; font-size:11.5px; color:var(--text-secondary); margin-bottom:6px; font-weight:500;}
.input-wrap{position:relative;}
.input-wrap .lead-icon{
  position:absolute; left:12px; top:50%; transform:translateY(-50%);
  color:var(--text-muted); display:flex; pointer-events:none;
}
.card input[type=email], .card input[type=password], .card input[type=text]{
  width:100%; height:42px; background:var(--page-bg); border:1px solid var(--border);
  color:var(--text-primary); border-radius:10px; padding:0 40px 0 38px; font-size:13px; font-family:inherit;
  transition:border-color .15s ease, box-shadow .15s ease;
}
.card input::placeholder{color:var(--text-muted);}
.card input:focus{outline:none; border-color:var(--blue); box-shadow:0 0 0 3px rgba(62,107,240,0.12); background:#fff;}
.toggle-eye{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  color:var(--text-muted); cursor:pointer; background:none; border:none; padding:0;
  display:flex; align-items:center;
}

.row-between{display:flex; align-items:center; justify-content:space-between; margin:2px 0 20px; font-size:11.5px;}
.remember{display:flex; align-items:center; gap:6px; color:var(--text-secondary);}
.remember input[type=checkbox]{width:14px; height:14px; padding:0; accent-color:var(--blue);}
.row-between a{color:var(--blue); text-decoration:none;}
.row-between a:hover{text-decoration:underline;}

.card button.primary{
  width:100%; height:44px; border:none; border-radius:10px; font-family:inherit; font-size:13.5px; font-weight:600;
  background:var(--blue); color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:8px;
  transition:background .15s ease, transform .12s ease;
}
.card button.primary:hover{background:var(--blue-dark);}
.card button.primary:active{transform:scale(0.98);}

.foot-note{text-align:center; font-size:11px; color:var(--text-muted); margin-top:18px;}

.error-msg{
  display:none; align-items:center; gap:7px; background:var(--danger-light); border:1px solid #F6C6C8;
  color:var(--danger); font-size:11.5px; padding:9px 12px; border-radius:9px; margin-bottom:14px;
}
.error-msg.show{display:flex;}

@media (max-width:820px){
  .panel-left{display:none;}
}
`;
