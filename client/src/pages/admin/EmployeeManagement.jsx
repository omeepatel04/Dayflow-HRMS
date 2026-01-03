import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Mail,
  Phone,
  User,
  Building2,
  Calendar,
  Briefcase,
} from "lucide-react";
import { usersAPI } from "../../services";
import WorkspaceLayout from "../../components/layout/WorkspaceLayout";
import { cn } from "../../utils/cn";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    employee_id: "",
    department: "",
    position: "",
    joining_date: "",
    password: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEmployees();
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params =
        statusFilter === "all"
          ? {}
          : { is_active: statusFilter === "active" ? true : false };
      const response = await usersAPI.getAllEmployees(params);
      // Backend returns { count, employees }, use employees array
      const employeesData = response.employees || response || [];
      const normalized = employeesData.map((item) => {
        const user = item.user || {};
        return {
          ...user,
          profile_id: item.id,
          phone: item.phone,
          department: item.department,
          position: item.job_title,
          joining_date: item.date_of_joining,
        };
      });
      setEmployees(normalized);
      setError("");
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees. Please try again.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const phoneValid = !formData.phone
      ? true
      : /^[+]?\d{10,15}$/.test(formData.phone.trim());
    const passwordValid = editingId
      ? true
      : /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(formData.password);

    if (!formData.first_name || !formData.email || !formData.employee_id) {
      setError(
        "Please fill in all required fields (first name, email, employee ID)."
      );
      return;
    }

    if (!emailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!phoneValid) {
      setError(
        "Enter a valid phone number (10-15 digits, digits/optional + only)."
      );
      return;
    }

    if (!passwordValid) {
      setError("Password must be 8+ characters with letters and numbers.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        const updated = await usersAPI.updateEmployee(editingId, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          employee_id: formData.employee_id,
          phone: formData.phone,
          department: formData.department,
          job_title: formData.position,
          date_of_joining: formData.joining_date,
          is_active: formData.is_active,
        });
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingId ? { ...emp, ...updated } : emp
          )
        );
      } else {
        const created = await usersAPI.createEmployee(formData);
        setEmployees((prev) => [...prev, created]);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        employee_id: "",
        department: "",
        position: "",
        joining_date: "",
        password: "",
        is_active: true,
      });
      setError("");
    } catch (err) {
      const data = err.response?.data;
      const firstFieldError =
        typeof data === "object" && data
          ? Object.values(data).flat().find(Boolean)
          : null;
      setError(
        data?.detail ||
          data?.message ||
          firstFieldError ||
          "Failed to save employee"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone || "",
      employee_id: employee.employee_id,
      department: employee.department || "",
      position: employee.position || "",
      joining_date: employee.joining_date || "",
      password: "",
      is_active: employee.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (employee) => {
    try {
      setLoading(true);
      const updated = await usersAPI.updateEmployee(employee.id, {
        is_active: !employee.is_active,
      });
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id ? { ...emp, ...updated } : emp
        )
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await usersAPI.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete employee"
      );
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employee_id: "",
      department: "",
      position: "",
      joining_date: "",
      password: "",
      is_active: true,
    });
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.employee_id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <WorkspaceLayout
      title="Employee Management"
      description="Add, edit, and manage employee records"
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#c4a3b3]" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] placeholder:text-[#c4a3b3] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            {["active", "inactive", "all"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold capitalize border transition",
                  statusFilter === status
                    ? "bg-[#75516c] text-white border-[#75516c]"
                    : "bg-white text-[#75516c] border-[rgba(117,81,108,0.25)] hover:border-[#75516c]"
                )}
              >
                {status === "inactive" ? "Not working" : status}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#75516c] text-white rounded-xl font-semibold hover:bg-[#6a4a63] transition"
          >
            <Plus className="h-5 w-5" />
            Add Employee
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-[#f0d7e3] border-t-[#75516c] rounded-full" />
            </div>
          </div>
        ) : (
          /* Employees Table */
          <div className="rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white/95 backdrop-blur-xl overflow-hidden shadow-[0_20px_60px_rgba(117,81,108,0.15)]">
            {filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <User className="h-12 w-12 text-[#c4a3b3] mx-auto mb-3" />
                <p className="text-[#8f6d80]">No employees found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[rgba(117,81,108,0.2)] bg-[#fef4f7]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Employee ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Position
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#75516c]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-[rgba(117,81,108,0.1)] hover:bg-[#fef4f7] transition"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-[#2f1a2c]">
                              {employee.first_name} {employee.last_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#8f6d80]">
                            {employee.employee_id}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#8f6d80]">{employee.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#8f6d80]">
                            {employee.department || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#8f6d80]">
                            {employee.position || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              employee.is_active
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                            )}
                          >
                            {employee.is_active ? "Working" : "Not working"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm font-medium"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(employee.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm font-medium"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                            <button
                              onClick={() => handleToggleActive(employee)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fef4f7] text-[#75516c] hover:bg-[#f4e3eb] transition text-sm font-medium"
                            >
                              {employee.is_active
                                ? "Set Not Working"
                                : "Set Active"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="max-w-2xl w-full rounded-2xl border border-[rgba(117,81,108,0.2)] bg-white shadow-2xl">
              <div className="border-b border-[rgba(117,81,108,0.2)] px-6 py-4">
                <h2 className="text-xl font-bold text-[#2f1a2c]">
                  {editingId ? "Edit Employee" : "Add New Employee"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employee_id"
                      value={formData.employee_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      placeholder="EMP001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      placeholder="Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      placeholder="Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#b28fa1] mb-2">
                      Password {editingId && "(leave empty to keep current)"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
                      required={!editingId}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      id="is_active"
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_active: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-[rgba(117,81,108,0.35)] text-[#75516c] focus:ring-[#75516c]"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-[#2f1a2c]"
                    >
                      Currently working
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-[rgba(117,81,108,0.2)]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] text-[#75516c] font-semibold hover:bg-[#fef4f7] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#75516c] text-white font-semibold hover:bg-[#6a4a63] transition"
                  >
                    {editingId ? "Update Employee" : "Add Employee"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
