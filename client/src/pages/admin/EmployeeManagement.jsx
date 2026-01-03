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
import { usersAPI } from "../../services/users.service";

// Dummy data for demonstration
const DUMMY_EMPLOYEES = [
  {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@company.com",
    phone: "+91 98765 43210",
    employee_id: "EMP001",
    department: "Engineering",
    position: "Senior Developer",
    joining_date: "2022-01-15",
  },
  {
    id: 2,
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "+91 98765 43211",
    employee_id: "EMP002",
    department: "Human Resources",
    position: "HR Manager",
    joining_date: "2021-06-20",
  },
  {
    id: 3,
    first_name: "Michael",
    last_name: "Chen",
    email: "michael.chen@company.com",
    phone: "+91 98765 43212",
    employee_id: "EMP003",
    department: "Product",
    position: "Product Manager",
    joining_date: "2022-03-10",
  },
  {
    id: 4,
    first_name: "Emily",
    last_name: "Williams",
    email: "emily.williams@company.com",
    phone: "+91 98765 43213",
    employee_id: "EMP004",
    department: "Design",
    position: "UI/UX Designer",
    joining_date: "2023-01-05",
  },
  {
    id: 5,
    first_name: "David",
    last_name: "Martinez",
    email: "david.martinez@company.com",
    phone: "+91 98765 43214",
    employee_id: "EMP005",
    department: "Engineering",
    position: "QA Engineer",
    joining_date: "2022-09-12",
  },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(DUMMY_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAllEmployees();
      // If API returns data, use it; otherwise fall back to dummy data
      setEmployees(
        response.data && response.data.length > 0
          ? response.data
          : DUMMY_EMPLOYEES
      );
      setError("");
    } catch (err) {
      // On error, still show dummy data
      console.error("Failed to fetch employees, using dummy data:", err);
      setEmployees(DUMMY_EMPLOYEES);
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

    if (
      !formData.first_name ||
      !formData.email ||
      !formData.password ||
      !formData.employee_id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        // Try to update via API
        try {
          await usersAPI.updateEmployee(editingId, formData);
        } catch (apiErr) {
          console.warn("API update failed, updating locally:", apiErr);
        }
        // Update local state regardless
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingId ? { ...emp, ...formData } : emp
          )
        );
      } else {
        // Try to create via API
        let newEmployee;
        try {
          const response = await usersAPI.createEmployee(formData);
          newEmployee = response.data || { id: Date.now(), ...formData };
        } catch (apiErr) {
          console.warn("API create failed, creating locally:", apiErr);
          newEmployee = { id: Date.now(), ...formData };
        }
        setEmployees((prev) => [...prev, newEmployee]);
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
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save employee");
      console.error(err);
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
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      // Try to delete via API
      try {
        await usersAPI.deleteEmployee(id);
      } catch (apiErr) {
        console.warn("API delete failed, deleting locally:", apiErr);
      }
      // Update local state regardless
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete employee");
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
    });
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.first_name} ${emp.last_name} ${emp.email} ${emp.employee_id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff9fb] via-[#fdeff3] to-[#fbe4ed] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2f1a2c] mb-2">
            Employee Management
          </h1>
          <p className="text-[#8f6d80]">
            Add, edit, and manage employee records
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#c4a3b3]" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(117,81,108,0.25)] bg-white/90 text-[#2f1a2c] placeholder:text-[#c4a3b3] focus:border-[#75516c] focus:ring-2 focus:ring-[#f0d7e3] focus:outline-none"
            />
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
      </div>

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
  );
}
