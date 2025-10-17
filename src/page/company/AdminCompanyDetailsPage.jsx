import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [company, setCompany] = React.useState(location.state?.company || null);

  React.useEffect(() => {
    const fetchCompany = async () => {
      if (!company) {
        try {
          const res = await API.get(`/getCompany/${id}`);


          setCompany(res.data);
        } catch (error) {
          console.error("Error fetching company:", error);
        }
      }
    };
    fetchCompany();
  }, [id, company]);

  if (!company)
    return <div className="p-6 text-center">Loading company details...</div>;

  const renderFileLink = (file) => {
    if (!file) return <p className="text-gray-500">Not Uploaded</p>;
    const fileName = file.includes("http") ? file : file.split(/[/\\]/).pop();
    const fileUrl =
      fileName.startsWith("http://") || fileName.startsWith("https://")
        ? fileName
        : `${IMAGE_URL}${fileName}`;
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-2 py-1 w-28 font-bold text-[12px] text-red-600 border rounded hover:border-black transition-colors duration-200"
      >
        View Document
      </a>
    );
  };

  // Define fields
  const importantFields = [
    "companyName",
    "registrationNumber",
    "providerNumber",
  ];
  const companyFields = [
    "companyEmail",
    "serviceStandards",
    "providerEmail",
    "efRemittance",
    "legalEntity",
    "providerName",
    "operatingName",
    "businessNumber",
    "address1",
    "address2",
    "province",
    "city",
    "postalCode",
    "website",
  ];
  // Exclude system or sensitive fields
  const excludedFields = [
    "__v",
    "_id",
    "createdAt",
    "updatedAt",
    "companyPassword",
    "agreementAccepted",
    "profileImage"
  ];
  const knownFields = [...importantFields, ...companyFields, ...excludedFields];
  const otherFields = Object.keys(company).filter(
    (key) => !knownFields.includes(key)
  );

  // Render section helper
  const renderSection = (title, fields) => (
    <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {fields.map((field) => (
          <div
            key={field}
            className="flex justify-content items-center border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-sm"
          >
            <p className="font-medium text-gray-700 capitalize whitespace-nowrap">
              {field.replace(/([A-Z])/g, " $1")}:
            </p>
            <p className="text-gray-900 ml-2 break-all">
              {["licenseProof", "signedAgreement", "voidCheque"].includes(field)
                ? renderFileLink(company[field])
                : company[field] || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded mb-4 hover:cursor-pointer"
      >
        ← Back
      </button>

      {/* Page Title */}
      <h2 className="text-2xl font-bold text-black mb-6 text-center">
        {company.companyName} — Full Details
      </h2>

      {/* Important Summary */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-black mb-4 border-b pb-2">
          Important Details
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {importantFields.map((field) => (
            <div
              key={field}
              className="flex justify-content items-center border border-gray-300 rounded-lg p-3 bg-white shadow-sm"
            >
              <p className="font-medium text-black capitalize whitespace-nowrap">
                {field.replace(/([A-Z])/g, " $1")}:
              </p>
              <p className="text-gray-900 ml-2 break-all">
                {company[field] || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Company Details */}
      {renderSection("Company Details", companyFields)}

      {/* Other Details */}
      {renderSection("Other Details", otherFields)}
    </div>
  );
};

export default CompanyDetailsPage;
