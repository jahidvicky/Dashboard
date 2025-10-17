import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import Swal from "sweetalert2";
import API from "../../API/Api";

const AddInsurancePolicy = () => {
  const [companyData, setCompanyData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    policyDetails: "",
    billingType: "invoice",
    coverage: "",
    renewalPeriod: "",
    coverageItems: ""
  });
  const [editId, setEditId] = useState(null);

  const getCompany = async () => {
    try {
      const companyData = JSON.parse(localStorage.getItem("user"));
      const companyId = companyData?._id;
      const res = await API.get(`/getCompanyById/${companyId}`, {
        withCredentials: true,
      });
      setCompanyData(res.data.company);


    } catch (error) {
      console.log(error);

    }
  }

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      const res = await API.get("/getPolicies");
      setPolicies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPolicies();
    getCompany();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit add / update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, coverageItems: formData.coverageItems.split(",") };
      if (editId) {
        await API.put(`/updatePolicy/${editId}`, payload);
        Swal.fire("Updated!", "Policy updated successfully", "success");
      } else {
        await API.post("/addPolicies", payload);
        Swal.fire("Added!", "Policy added successfully", "success");
      }
      setShowModal(false);
      setFormData({
        companyName: "",
        policyDetails: "",
        billingType: "invoice",
        coverage: "",
        renewalPeriod: "",
        coverageItems: ""
      });
      setEditId(null);
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete policy
  const handleDelete = async (id) => {
    try {
      await API.delete(`/deletePolicy/${id}`);
      Swal.fire("Deleted!", "Policy deleted", "success");
      fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit policy
  const handleUpdateClick = (policy) => {
    setFormData({
      companyName: policy.companyName,
      policyDetails: policy.policyDetails,
      billingType: policy.billingType,
      coverage: policy.coverage,
      renewalPeriod: policy.renewalPeriod,
      coverageItems: policy.coverageItems.join(",")
    });
    setEditId(policy._id);
    setShowModal(true);
  };



  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Insurance Policies</h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditId(null);
            setFormData({
              companyName: companyData?.companyName || "",
              policyDetails: "",
              billingType: "invoice",
              coverage: "",
              renewalPeriod: "",
              coverageItems: ""
            });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:cursor-pointer"
        >
          Add Policy
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-x-4 bg-black text-white py-2 px-4 font-semibold">
          <div>S.NO</div>
          <div>Company Name</div>
          <div>Details</div>
          <div>Billing Type</div>
          <div>Coverage</div>
          <div>Renewal / Items</div>
          <div>Action</div>
        </div>
        {policies.map((p, i) => (
          <div
            key={p._id}
            className="grid grid-cols-7 gap-x-4 items-center border-b py-2 px-4"
          >
            <div>{i + 1}</div>
            <div>{p.companyName}</div>
            <div>{p.policyDetails}</div>
            <div>{p.billingType}</div>
            <div>{p.coverage}</div>
            <div>
              {p.renewalPeriod} <br /> ({p.coverageItems.join(", ")})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateClick(p)}
                className="bg-blue-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer"
              >
                <RiEdit2Fill />
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="bg-red-500 px-3 py-1 rounded-xl text-white hover:cursor-pointer"
              >
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4 my-20 relative">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Policy" : "Add Policy"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ""}
                onChange={handleChange}
                placeholder="Company Name"
                className="border p-2 w-full rounded"
              />
              <textarea
                name="policyDetails"
                value={formData.policyDetails}
                onChange={handleChange}
                placeholder="Policy Details"
                className="border p-2 w-full rounded"
              />
              <select
                name="billingType"
                value={formData.billingType}
                onChange={handleChange}
                className="border p-2 w-full rounded"
              >
                <option value="invoice">Invoice</option>
                <option value="direct">Direct Billing</option>
              </select>
              <input
                type="text"
                name="coverage"
                value={formData.coverage}
                onChange={handleChange}
                placeholder="Coverage"
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="renewalPeriod"
                value={formData.renewalPeriod}
                onChange={handleChange}
                placeholder="Renewal Period"
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="coverageItems"
                value={formData.coverageItems}
                onChange={handleChange}
                placeholder="Coverage Items (comma separated)"
                className="border p-2 w-full rounded"
              />
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInsurancePolicy;
