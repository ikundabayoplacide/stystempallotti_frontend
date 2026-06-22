import { useEffect, useState } from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { DashboardLayout } from "../components";
import { useAuth } from "../context/AuthContext";
import { useAppSelector } from "../store/hooks";
import {
  useChangePasswordMutation,
  useGetMeQuery,
  useUpdateMeMutation,
} from "../store/services/usersService";

type Tab = "profile" | "password";

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
      type === "success"
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-red-50 border border-red-200 text-red-700"
    }`}>
      {type === "success"
        ? <HiOutlineCheckCircle className="w-4 h-4 flex-shrink-0" />
        : <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-custom-300 bg-style-600 text-secondary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-custom-500";
const labelCls = "block text-xs font-semibold text-custom-700 mb-1.5";

function PasswordInput({ value, onChange, placeholder, required }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-custom-300 bg-style-600 text-secondary-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-custom-500"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-500 hover:text-secondary-100 transition-colors"
        tabIndex={-1}
      >
        {show ? <HiOutlineEyeOff className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { userRole, userName } = useAuth();
  const authUser = useAppSelector((s) => s.auth.user);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const { data: me, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [changePassword, { isLoading: changingPwd }] = useChangePasswordMutation();

  // ── Profile state ──────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [profileAlert, setProfileAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", gender: "" });

  useEffect(() => {
    if (me) setProfileForm({ name: me.name ?? "", phone: me.phone ?? "", gender: me.gender ?? "" });
  }, [me]);

  const handleProfileSave = async () => {
    try {
      await updateMe(profileForm).unwrap();
      setEditMode(false);
      setProfileAlert({ type: "success", msg: "Profile updated successfully." });
    } catch {
      setProfileAlert({ type: "error", msg: "Failed to update profile." });
    }
    setTimeout(() => setProfileAlert(null), 4000);
  };

  // ── Password state ─────────────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwdAlert, setPwdAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdAlert({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdAlert({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }
    try {
      await changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }).unwrap();
      setPwdForm({ currentPassword: "", newPassword: "", confirm: "" });
      setPwdAlert({ type: "success", msg: "Password changed successfully." });
    } catch {
      setPwdAlert({ type: "error", msg: "Current password is incorrect." });
    }
    setTimeout(() => setPwdAlert(null), 4000);
  };

  const displayName = me?.name ?? userName ?? "User";
  const displayRole = String(me?.role ?? userRole ?? "").replace("-", " ");
  const displayEmail = me?.email ?? authUser?.email ?? "";

  const tabs: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: "profile",  label: "Profile",  icon: HiOutlineUser,       desc: "Personal information" },
    { key: "password", label: "Password", icon: HiOutlineLockClosed, desc: "Security & credentials" },
  ];

  return (
    <DashboardLayout userRole={userRole ?? "receptionist"} userName={userName ?? "User"}>
      <div className="font-[family-name:var(--font-family-primary)]">

        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">Settings</h1>
          <p className="text-sm text-custom-700 mt-1">Manage your account and security preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left panel ─────────────────────────────────────────────────── */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-3">

            {/* Avatar card */}
            <div className="bg-style-600 border border-custom-300 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* online dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-style-600 rounded-full" />
              </div>
              <div>
                <p className="font-bold text-secondary-100 text-base">{displayName}</p>
                <p className="text-xs text-custom-700 capitalize mt-0.5">{displayRole}</p>
                <p className="text-xs text-custom-500 mt-0.5 truncate max-w-[180px]">{displayEmail}</p>
              </div>
              {me?.createdAt && (
                <p className="text-[11px] text-custom-500 bg-custom-100 px-3 py-1 rounded-full">
                  Since {new Date(me.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              )}
            </div>

            {/* Tab nav */}
            <div className="bg-style-600 border border-custom-300 rounded-2xl overflow-hidden">
              {tabs.map(({ key, label, icon: Icon, desc }, i) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${
                    i !== 0 ? "border-t border-custom-200" : ""
                  } ${
                    activeTab === key
                      ? "bg-primary-500 text-white"
                      : "text-custom-700 hover:bg-custom-100 hover:text-secondary-100"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activeTab === key ? "bg-white/20" : "bg-custom-100"
                  }`}>
                    <Icon className={`w-4 h-4 ${activeTab === key ? "text-white" : "text-custom-700"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${activeTab === key ? "text-white" : ""}`}>{label}</p>
                    <p className={`text-[11px] ${activeTab === key ? "text-white/70" : "text-custom-500"}`}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ── Profile Tab ─────────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="bg-style-600 border border-custom-300 rounded-2xl overflow-hidden">

                {/* Tab header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-custom-200">
                  <div>
                    <h2 className="font-bold text-secondary-100">Personal Information</h2>
                    <p className="text-xs text-custom-700 mt-0.5">Your name, contact details and more</p>
                  </div>
                  {!editMode && !isLoading && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 hover:text-secondary-100 transition-colors"
                    >
                      <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  {editMode && (
                    <button
                      onClick={() => { setEditMode(false); setProfileForm({ name: me?.name ?? "", phone: me?.phone ?? "", gender: me?.gender ?? "" }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-custom-300 text-xs font-semibold text-custom-700 hover:bg-custom-100 transition-colors"
                    >
                      <HiOutlineX className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {profileAlert && <div className="mb-5"><Alert {...profileAlert} /></div>}

                  {isLoading ? (
                    <div className="space-y-4">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="h-3 w-20 bg-custom-200 rounded animate-pulse" />
                          <div className="h-10 bg-custom-100 rounded-xl animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Full Name</label>
                          <input type="text" value={profileForm.name}
                            onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                            className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Phone</label>
                          <input type="text" value={profileForm.phone}
                            onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                            className={inputCls} />
                        </div>
                      </div>
                      <div className="sm:w-1/2">
                        <label className={labelCls}>Gender</label>
                        <select value={profileForm.gender}
                          onChange={(e) => setProfileForm((p) => ({ ...p, gender: e.target.value }))}
                          className={inputCls}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div className="pt-2">
                        <button onClick={handleProfileSave} disabled={saving}
                          className="px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors">
                          {saving ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                      {[
                        { label: "Full Name",    value: me?.name ?? userName ?? "—" },
                        { label: "Email",        value: displayEmail || "—" },
                        { label: "Phone",        value: me?.phone || "—" },
                        { label: "Gender",       value: me?.gender || "—" },
                        { label: "Role",         value: displayRole },
                      ].map(({ label, value }) => (
                        <div key={label} className="py-3.5 border-b border-custom-100">
                          <p className="text-[11px] font-semibold text-custom-500 uppercase tracking-wide mb-0.5">{label}</p>
                          <p className="text-sm text-secondary-100 font-medium capitalize">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Password Tab ─────────────────────────────────────────────── */}
            {activeTab === "password" && (
              <div className="bg-style-600 border border-custom-300 rounded-2xl overflow-hidden">

                {/* Tab header */}
                <div className="px-6 py-4 border-b border-custom-200">
                  <h2 className="font-bold text-secondary-100">Change Password</h2>
                  <p className="text-xs text-custom-700 mt-0.5">Update your password to keep your account secure</p>
                </div>

                <div className="p-6">
                  {pwdAlert && <div className="mb-5"><Alert {...pwdAlert} /></div>}

                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">

                    {/* Current password */}
                    <div>
                      <label className={labelCls}>Current Password</label>
                      <PasswordInput
                        value={pwdForm.currentPassword}
                        onChange={(v) => setPwdForm((p) => ({ ...p, currentPassword: v }))}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div className="border-t border-custom-200 pt-5 space-y-4">
                      <div>
                        <label className={labelCls}>New Password</label>
                        <PasswordInput
                          value={pwdForm.newPassword}
                          onChange={(v) => setPwdForm((p) => ({ ...p, newPassword: v }))}
                          placeholder="At least 6 characters"
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Confirm New Password</label>
                        <PasswordInput
                          value={pwdForm.confirm}
                          onChange={(v) => setPwdForm((p) => ({ ...p, confirm: v }))}
                          placeholder="Repeat new password"
                          required
                        />
                        {/* live match indicator */}
                        {pwdForm.confirm && (
                          <p className={`text-xs mt-1.5 font-medium ${
                            pwdForm.newPassword === pwdForm.confirm ? "text-emerald-500" : "text-red-500"
                          }`}>
                            {pwdForm.newPassword === pwdForm.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>
                    </div>

                    <button type="submit" disabled={changingPwd}
                      className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors">
                      {changingPwd ? "Updating…" : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
