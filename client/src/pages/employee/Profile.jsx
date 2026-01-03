import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Camera, Save, ShieldCheck, Upload } from "lucide-react";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { getNavigationForRoute } from "../../config/navigation";
import { useAttendance } from "../../hooks/useAttendance";
import { useAuth } from "../../context/AuthContext";
import { authAPI, payrollAPI } from "../../services";
import { cn } from "../../utils/cn";

const LABEL_TONE = "text-xs uppercase tracking-[0.35em] text-[#b28fa1]";
const BORDER_SOFT = "border-[rgba(117,81,108,0.18)]";
const CHIP_BG = "bg-[#fef4f7]";
const SUB_TEXT = "text-sm text-[#7f5a6f]";

const ProfilePage = () => {
  const location = useLocation();
  const attendance = useAttendance();
  const { user, updateProfile } = useAuth();
  const [activeProfileTab, setActiveProfileTab] = useState("personal");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [salaryError, setSalaryError] = useState(null);
  const [form, setForm] = useState({
    phone: "",
    address: "",
    location: "",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authAPI.getEmployeeProfile();
        setProfile(data);
        setForm({
          phone: data.phone || "",
          address: data.address || "",
          location: data.location || "",
        });
        try {
          const salaryData = await payrollAPI.getSalaryStructure();
          setSalaryStructure(salaryData);
          setSalaryError(null);
        } catch (salaryErr) {
          if (salaryErr?.response?.status !== 404) {
            console.error("Failed to load salary structure:", salaryErr);
          }
          setSalaryError("No salary structure found for this employee.");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Unable to load your profile right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setIsSaved(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      setError("");
      // Backend accepts phone/address/job_title/department/date_of_joining/profile_picture/resume/id_proof
      await authAPI.updateEmployeeProfile({
        phone: form.phone,
        address: form.address,
      });
      if (updateProfile) {
        await updateProfile({
          phone: form.phone,
          address: form.address,
        });
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(
        err.response?.data?.message || "Could not save changes. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const response = await authAPI.uploadProfilePicture(file);
      // Backend returns { message, profile }, extract profile
      const updatedProfile = response?.profile || response;
      setProfile((prev) => ({
        ...prev,
        profile_picture: updatedProfile.profile_picture,
      }));
      if (updateProfile) {
        await updateProfile({
          profile_picture: updatedProfile.profile_picture,
        });
      }
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (type, file) => {
    if (!file) return;
    try {
      const data = type === "resume" ? { resume: file } : { idProof: file };
      await authAPI.uploadDocuments(data);
      setError("");
      setProfile((prev) => ({
        ...prev,
        [type === "resume" ? "resume" : "id_proof"]: "uploaded",
      }));
    } catch (err) {
      console.error("Failed to upload document:", err);
      setError("Document upload failed. Please retry.");
    }
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "HR";

  const nav = getNavigationForRoute(user?.role, location.pathname);

  const profileTabs = [
    { key: "personal", label: "Resume" },
    { key: "private", label: "Private Info" },
    ...(isAdmin ? [{ key: "salary", label: "Salary Info" }] : []),
    { key: "security", label: "Security" },
  ];

  const sidebar = (
    <div className="glass-panel space-y-5 p-6 text-sm text-[#7f5a6f]">
      <p className={LABEL_TONE}>Access</p>
      <p>
        Employees can edit phone, contact address, and avatar. HR & Admin keep
        the rest locked.
      </p>
      <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
        <ShieldCheck className="h-5 w-5 text-[#2f9c74]" />
        <p className="mt-3 text-sm text-[#2f1627]">
          Last verified on 24 Dec 2025
        </p>
      </div>
    </div>
  );

  return (
    <WorkspaceLayout
      title="My Profile"
      description="Personal data, job context, and compliance docs in one calm space. Editable inputs are highlighted."
      tabs={nav.tabs}
      activeTab={nav.activeTab}
      statusIndicator={attendance.status}
      sidebar={sidebar}
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-2xl bg-[#fef4f7]"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="glass-panel p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative h-28 w-28">
                {profile?.profile_picture || user?.avatar ? (
                  <img
                    src={profile?.profile_picture || user?.avatar}
                    alt={user?.full_name}
                    className="h-full w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-3xl bg-[#fef1f5] text-3xl font-semibold text-[#75516c]">
                    {user?.first_name?.[0] || "U"}
                  </div>
                )}
                <label className="absolute -right-2 -bottom-2 inline-flex items-center gap-1 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-3 py-1 text-xs text-[#75516c] cursor-pointer hover:bg-white">
                  <Camera className="h-3.5 w-3.5" />
                  {uploadingPhoto ? "Uploading..." : "Update photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div>
                <p className={LABEL_TONE}>{profile?.department || "General"}</p>
                <h2 className="text-2xl font-semibold text-[#2f1627]">
                  {user?.full_name || "User"}
                </h2>
                <p className={SUB_TEXT}>{profile?.job_title || "Employee"}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#75516c]">
                  <span className={cn("rounded-full px-3 py-1", BORDER_SOFT)}>
                    Employee ID {user?.employee_id}
                  </span>
                  <span className={cn("rounded-full px-3 py-1", BORDER_SOFT)}>
                    Joined{" "}
                    {profile?.date_of_joining
                      ? new Date(profile.date_of_joining).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel mt-6 p-6">
            <div className="flex flex-wrap gap-2 border-b border-[rgba(117,81,108,0.18)] pb-4">
              {profileTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveProfileTab(tab.key)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-t-2xl transition",
                    activeProfileTab === tab.key
                      ? "text-[#2f1627] border-b-2 border-[#75516c]"
                      : "text-[#8f6d80] hover:text-[#75516c]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {activeProfileTab === "personal" && (
                <div className="space-y-4">
                  <div>
                    <p className={LABEL_TONE}>Contactable fields</p>
                    <h3 className="text-lg font-semibold text-[#2f1627]">
                      You can edit these
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <EditableField
                      label="Phone"
                      value={form.phone}
                      onChange={(value) => handleChange("phone", value)}
                    />
                    <EditableField
                      label="Workspace"
                      value={form.location}
                      onChange={(value) => handleChange("location", value)}
                    />
                  </div>
                  <EditableField
                    label="Address"
                    value={form.address}
                    onChange={(value) => handleChange("address", value)}
                    multiline
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-2 text-sm text-[#75516c]"
                  >
                    <Save className="h-4 w-4" /> Save changes
                  </button>
                  {isSaved ? (
                    <p className="text-xs uppercase tracking-[0.4em] text-[#2f9c74]">
                      Saved locally
                    </p>
                  ) : null}
                </div>
              )}

              {activeProfileTab === "private" && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className={LABEL_TONE}>Job outlines</p>
                    <div className="mt-3 space-y-3 text-sm text-[#2f1627]">
                      {[
                        { label: "Job Title", value: profile?.job_title },
                        { label: "Department", value: profile?.department },
                        {
                          label: "Date of Joining",
                          value: profile?.date_of_joining
                            ? new Date(
                                profile.date_of_joining
                              ).toLocaleDateString()
                            : null,
                        },
                        { label: "Employee ID", value: user?.employee_id },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            "rounded-2xl px-4 py-3",
                            BORDER_SOFT,
                            CHIP_BG
                          )}
                        >
                          <p className={LABEL_TONE}>{item.label}</p>
                          <p className="mt-1 text-sm text-[#2f1627]">
                            {item.value || "Not set"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={LABEL_TONE}>Documents</p>
                    <div className="mt-3 space-y-3">
                      {[
                        {
                          name: "Resume",
                          status: profile?.resume ? "Uploaded" : "Missing",
                          link: profile?.resume,
                        },
                        {
                          name: "ID Proof",
                          status: profile?.id_proof ? "Uploaded" : "Missing",
                          link: profile?.id_proof,
                        },
                      ].map((doc) => (
                        <div
                          key={doc.name}
                          className={cn(
                            "flex items-center justify-between rounded-2xl px-4 py-3 text-sm",
                            BORDER_SOFT,
                            CHIP_BG
                          )}
                        >
                          <div>
                            <p className="font-semibold text-[#2f1627]">
                              {doc.name}
                            </p>
                            <p className="text-xs text-[#8b6b7e]">
                              {doc.link ? "Available" : "Not uploaded"}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              doc.link
                                ? "border border-[#b5e1cd] text-[#2f9c74]"
                                : "border border-[#f0c59c] text-[#d47f2f]"
                            )}
                          >
                            {doc.status}
                          </span>
                        </div>
                      ))}
                      <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,81,108,0.35)] px-4 py-3 text-sm text-[#75516c] hover:border-[#75516c]">
                        <Upload className="h-4 w-4" /> Upload document
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          className="hidden"
                          onChange={(event) =>
                            handleDocumentUpload(
                              "resume",
                              event.target.files[0]
                            )
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === "salary" && isAdmin && (
                <div className="space-y-4">
                  <p className={LABEL_TONE}>Salary Information (Admin Only)</p>
                  {salaryStructure ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <SalaryTile
                          label="Basic Salary"
                          value={formatCurrency(salaryStructure.basic_salary)}
                        />
                        <SalaryTile
                          label="HRA"
                          value={formatCurrency(salaryStructure.hra)}
                        />
                        <SalaryTile
                          label="Transport Allowance"
                          value={formatCurrency(
                            salaryStructure.transport_allowance
                          )}
                        />
                        <SalaryTile
                          label="Medical Allowance"
                          value={formatCurrency(
                            salaryStructure.medical_allowance
                          )}
                        />
                        <SalaryTile
                          label="Gross Salary"
                          value={formatCurrency(
                            salaryStructure.gross_salary_amount
                          )}
                        />
                        <SalaryTile
                          label="Net Salary"
                          value={formatCurrency(
                            salaryStructure.net_salary_amount
                          )}
                        />
                      </div>
                      <div>
                        <p className={LABEL_TONE}>Effective From</p>
                        <p className="mt-2 text-sm text-[#2f1627]">
                          {salaryStructure.effective_from
                            ? new Date(
                                salaryStructure.effective_from
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className={SUB_TEXT}>
                      {salaryError || "Salary data unavailable."}
                    </p>
                  )}
                </div>
              )}

              {activeProfileTab === "security" && (
                <div>
                  <p className={LABEL_TONE}>Security Settings</p>
                  <p className={SUB_TEXT + " mt-2"}>
                    Manage your account security preferences
                  </p>
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      className="w-full rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-3 text-left text-sm text-[#2f1627] hover:bg-[#f8edf1]"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/80 px-4 py-3 text-left text-sm text-[#2f1627] hover:bg-[#f8edf1]"
                    >
                      Two-Factor Authentication
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </WorkspaceLayout>
  );
};

const SalaryTile = ({ label, value }) => (
  <div className={cn("rounded-2xl p-4", BORDER_SOFT, CHIP_BG)}>
    <p className={LABEL_TONE}>{label}</p>
    <p className="mt-2 text-2xl font-semibold text-[#2f1627]">{value || "—"}</p>
  </div>
);

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "—";
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `${amount}`;
  return `₹${numeric.toLocaleString("en-IN")}`;
}

const EditableField = ({ label, value, onChange, multiline = false }) => (
  <label className="block space-y-2 text-sm text-[#2f1627]">
    <span className={LABEL_TONE}>{label}</span>
    {multiline ? (
      <textarea
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm"
      />
    ) : (
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[rgba(117,81,108,0.25)] bg-white/95 px-3 py-3 text-sm"
      />
    )}
  </label>
);

export default ProfilePage;
