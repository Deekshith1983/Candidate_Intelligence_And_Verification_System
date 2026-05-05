import { useState, useEffect, useRef } from "react";
import { createProject, updateProject } from "../../../api/candidate.api";
import { triggerScore } from "../../../api/score.api";

// ── Colour tokens ────────────────────────────────────────────────────
const C = {
  teal:      "#0D9488",
  navy:      "#0F172A",
  lightTeal: "#CCFBF1",
  slate:     "#475569",
  mild:      "#F1F5F9",
  white:     "#FFFFFF",
  green:     "#DCFCE7",
  greenTxt:  "#16a34a",
  yellow:    "#FEF9C3",
  yellowTxt: "#a16207",
  red:       "#FEE2E2",
  redTxt:    "#dc2626",
};

const GITHUB_REGEX = /^https?:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

// ── Tag input component ──────────────────────────────────────────────
function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  const removeTag = (idx) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div style={{
      border: `1px solid #cbd5e1`, borderRadius: 6, padding: "6px 10px",
      display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
      minHeight: 42, background: C.white, cursor: "text",
    }}
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      {tags.map((t, i) => (
        <span key={i} style={{
          background: C.lightTeal, color: C.teal,
          borderRadius: 999, padding: "2px 10px",
          fontSize: 12, fontWeight: 600,
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          {t}
          <button
            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
            style={{ background:"none", border:"none", cursor:"pointer",
              color:C.teal, padding:0, fontSize:13, lineHeight:1 }}
          >×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (["Enter","Tab",","].includes(e.key)) { e.preventDefault(); addTag(); }
          if (e.key === "Backspace" && !input) removeTag(tags.length - 1);
        }}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{
          border: "none", outline: "none", flex: 1, minWidth: 80,
          fontSize: 13, color: C.navy, background: "transparent",
        }}
      />
    </div>
  );
}

// ── Input field ──────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 700,
        color: C.teal, marginBottom: 6, textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        {label}{required && <span style={{ color:"#ef4444" }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin:"4px 0 0", fontSize:12, color:"#ef4444" }}>{error}</p>
      )}
    </div>
  );
}

// ── Verification spinner / result ────────────────────────────────────
function VerifyStatus({ status, project }) {
  if (!status) return null;

  if (status === "loading") {
    return (
      <div style={{
        display:"flex", alignItems:"center", gap:12,
        padding:"14px 16px", background:C.mild,
        borderRadius:8, marginTop:16,
      }}>
        <div style={{
          width:20, height:20, borderRadius:"50%",
          border:`3px solid ${C.lightTeal}`,
          borderTopColor: C.teal,
          animation:"spin 0.8s linear infinite", flexShrink:0,
        }} />
        <div>
          <div style={{ fontWeight:700, color:C.navy, fontSize:13 }}>
            Verifying with GitHub…
          </div>
          <div style={{ color:C.slate, fontSize:12 }}>
            Checking repo visibility, README, and your commits
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && project) {
    const score = project.project_score;
    const tier  = score >= 75 ? { bg:C.green, txt:C.greenTxt, label:"Strong" }
                : score >= 50 ? { bg:C.yellow, txt:C.yellowTxt, label:"Moderate" }
                              : { bg:C.red, txt:C.redTxt, label:"Needs Work" };
    return (
      <div style={{
        marginTop:16, border:`1px solid #e2e8f0`,
        borderRadius:8, overflow:"hidden",
      }}>
        <div style={{
          background:C.green, padding:"10px 16px",
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span style={{ fontSize:18 }}>✅</span>
          <span style={{ fontWeight:700, color:C.greenTxt, fontSize:14 }}>
            Verification complete
          </span>
          <div style={{
            marginLeft:"auto",
            background:tier.bg, color:tier.txt,
            borderRadius:999, padding:"2px 12px",
            fontSize:12, fontWeight:700,
          }}>
            Score: {score}/100 · {tier.label}
          </div>
        </div>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          padding:"12px 16px", gap:10, background:C.white,
        }}>
          {[
            ["Public Repo",   project.is_public    ? "✓" : "✗", project.is_public],
            ["README",        project.has_readme   ? "✓" : "✗", project.has_readme],
            ["Your Commits",  `${project.user_commits ?? 0}`,  (project.user_commits ?? 0) > 0],
          ].map(([label, val, ok]) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{
                fontSize:20, fontWeight:800,
                color: ok ? C.teal : "#ef4444",
              }}>{val}</div>
              <div style={{ fontSize:11, color:C.slate }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        marginTop:16, padding:"12px 16px",
        background:C.red, borderRadius:8,
        display:"flex", alignItems:"center", gap:10,
      }}>
        <span style={{ fontSize:18 }}>❌</span>
        <div>
          <div style={{ fontWeight:700, color:C.redTxt, fontSize:13 }}>
            Verification failed
          </div>
          <div style={{ color:C.redTxt, fontSize:12 }}>
            {project?.reason || "Could not verify repository. Check the URL and try again."}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════
export default function AddProjectModal({ project: editProject, candidateId, onClose, onSaved }) {
  const isEdit = !!editProject;

  const [form, setForm] = useState({
    title:       editProject?.title       || "",
    description: editProject?.description || "",
    github_link: editProject?.github_link || "",
    tech_stack:  editProject?.tech_stack  || [],
  });
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim())       errs.title = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (!form.github_link.trim()) {
      errs.github_link = "GitHub URL is required.";
    } else if (!GITHUB_REGEX.test(form.github_link.trim())) {
      errs.github_link = "Must be a valid GitHub repo URL (e.g. https://github.com/user/repo)";
    }
    if (form.tech_stack.length === 0) errs.tech_stack = "Add at least one technology.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setVerifyStatus("loading");
    setVerifyResult(null);

    try {
      let result;
      if (isEdit) {
        const res = await updateProject(editProject._id, form);
        result = res.data.data;
      } else {
        const res = await createProject(form);
        result = res.data.data;
      }

      setVerifyResult(result);
      setVerifyStatus(result.verified ? "success" : "error");

      // ✅ FIXED: Don't wait for triggerScore - fire and forget
      // This allows immediate modal close and UI update
      if (candidateId) {
        triggerScore(candidateId).catch((err) => {
          console.error('[AddProjectModal] Score trigger failed (non-blocking):', err);
          // Non-blocking - project already saved and shown in UI
        });
      }

      // Immediately notify parent and close modal (don't wait for score)
      // Use small delay to show the success result visually
      setTimeout(() => onSaved(result), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || "Submission failed.";
      setVerifyStatus("error");
      setVerifyResult({ reason: msg });
      setSubmitting(false);
    }
  };

  const urlValid = GITHUB_REGEX.test(form.github_link.trim());

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── Backdrop ──────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(15,23,42,0.6)",
          backdropFilter:"blur(3px)",
        }}
      />

      {/* ── Modal box ─────────────────────────────────────── */}
      <div style={{
        position:"fixed", top:"50%", left:"50%", zIndex:1001,
        transform:"translate(-50%,-50%)",
        width:"min(540px, 94vw)",
        background:C.white, borderRadius:10,
        boxShadow:"0 20px 60px rgba(0,0,0,0.25)",
        maxHeight:"90vh", overflowY:"auto",
        animation:"fadeIn 0.2s ease",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"18px 24px 14px",
          borderBottom:`1px solid #e2e8f0`,
          position:"sticky", top:0, background:C.white, zIndex:1,
        }}>
          <div>
            <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:C.navy }}>
              {isEdit ? "Edit Project" : "Add New Project"}
            </h2>
            <p style={{ margin:"2px 0 0", fontSize:12, color:C.slate }}>
              {isEdit
                ? "Update project details — re-verification will run automatically."
                : "Submit your project to be verified against GitHub and scored."}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background:"none", border:"none", cursor:"pointer",
              color:C.slate, fontSize:22, padding:"0 4px", lineHeight:1,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding:24 }}>

          {/* Title */}
          <Field label="Project Title" required error={errors.title}>
            <input
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. E-Commerce Platform"
              style={{
                width:"100%", boxSizing:"border-box",
                border:`1px solid ${errors.title ? "#fca5a5" : "#cbd5e1"}`,
                borderRadius:6, padding:"9px 12px",
                fontSize:14, color:C.navy, outline:"none",
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.teal}44`}
              onBlur={(e)  => e.target.style.boxShadow = "none"}
            />
          </Field>

          {/* Description */}
          <Field label="Description" required error={errors.description}>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Brief summary of what this project does and your role in it."
              rows={3}
              style={{
                width:"100%", boxSizing:"border-box",
                border:`1px solid ${errors.description ? "#fca5a5" : "#cbd5e1"}`,
                borderRadius:6, padding:"9px 12px",
                fontSize:14, color:C.navy, outline:"none",
                resize:"vertical", fontFamily:"inherit",
              }}
              onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.teal}44`}
              onBlur={(e)  => e.target.style.boxShadow = "none"}
            />
          </Field>

          {/* GitHub URL */}
          <Field label="GitHub Repository URL" required error={errors.github_link}>
            <div style={{ position:"relative" }}>
              <input
                value={form.github_link}
                onChange={set("github_link")}
                placeholder="https://github.com/username/repository"
                style={{
                  width:"100%", boxSizing:"border-box",
                  border:`1px solid ${errors.github_link ? "#fca5a5" : "#cbd5e1"}`,
                  borderRadius:6, padding:"9px 40px 9px 12px",
                  fontSize:13, color:C.navy, outline:"none",
                }}
                onFocus={(e) => e.target.style.boxShadow = `0 0 0 2px ${C.teal}44`}
                onBlur={(e)  => e.target.style.boxShadow = "none"}
              />
              {form.github_link && (
                <span style={{
                  position:"absolute", right:12, top:"50%",
                  transform:"translateY(-50%)",
                  fontSize:16,
                }}>
                  {urlValid ? "✅" : "❌"}
                </span>
              )}
            </div>
          </Field>

          {/* Tech stack */}
          <Field label="Tech Stack" required error={errors.tech_stack}>
            <TagInput
              tags={form.tech_stack}
              onChange={(tags) => setForm((p) => ({ ...p, tech_stack: tags }))}
              placeholder="Type a technology and press Enter (e.g. React, Node.js)"
            />
            <p style={{ margin:"4px 0 0", fontSize:11, color:C.slate }}>
              Press Enter, Tab, or comma to add each technology.
            </p>
          </Field>

          {/* Verify result */}
          <VerifyStatus status={verifyStatus} project={verifyResult} />

          {/* Actions */}
          <div style={{
            display:"flex", gap:10, marginTop:20,
            justifyContent:"flex-end",
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background:"transparent",
                border:`1.5px solid ${C.teal}`, color:C.teal,
                borderRadius:6, padding:"9px 20px",
                fontSize:14, fontWeight:600, cursor:"pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "#0d6bee" : C.navy,
                color: C.white,
                border:"none",
                borderRadius:6, padding:"9px 24px",
                fontSize:14, fontWeight:700,
                cursor: submitting ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", gap:8,
                minWidth:160, justifyContent:"center",
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width:14, height:14, borderRadius:"50%",
                    border:"2px solid rgba(69, 6, 243, 0.3)",
                    borderTopColor:"#fff",
                    animation:"spin 0.8s linear infinite",
                  }} />
                  Verifying…
                </>
              ) : (
                isEdit ? "Save Changes" : "Submit & Verify"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
