import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API, { IMAGE_URL } from "../../../API/Api";
import Loader from "../../loader/Loader";

const ClaimDetails = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await API.get(`/claims/${claimId}`);
        console.log(res.data);

        setClaim(res.data);

        //  Filter cartItems to only the claimed product
        const claimedProduct = res.data?.orderId?.cartItems.filter(
          (item) => String(item._id) === String(res.data.productId)
        );
        setCartItems(claimedProduct || []);
      } catch (err) {
        console.error("Failed to load claim", err);
      }
    };
    fetchClaim();
  }, [claimId]);

  if (!claim) return <Loader />;

  const statusColor =
    claim.status === "Approved"
      ? "text-green-600"
      : claim.status === "Pending"
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <motion.div
      className="min-h-screen bg-gray-100 py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-700 hover:bg-gray-900 text-white px-5 py-2 rounded-lg transition-all hover:cursor-pointer"
              >
                Back
              </button>
              <div className="flex-1 text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Claim Details
                </h2>
              </div>
              {/* Invisible element for balance */}
              <div className="w-[90px]"></div>
            </div>
          </div>

          {/* Claim Summary */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Claim Summary
            </h3>

            {!claim.claimAmount ? (
              // When claim amount is NOT present
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Claim Status:</strong>{" "}
                  <span className={statusColor}>{claim.status}</span>
                </p>
                <p>
                  <strong>Claim Date:</strong>{" "}
                  {new Date(claim.claimDate).toLocaleDateString()}
                </p>
                <div className="sm:col-span-2">
                  <p>
                    <strong>Claim Description:</strong> {claim.description}
                  </p>
                </div>
              </div>
            ) : (
              // When claim amount IS present
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong>Claim Status:</strong>{" "}
                  <span className={statusColor}>{claim.status}</span>
                </p>
                <p>
                  <strong>Claim Settlement Amount:</strong>{" "}
                  <span>${claim.claimAmount}</span>
                </p>
                <p>
                  <strong>Claim Settlement Note:</strong>{" "}
                  <span>{claim.notes || "—"}</span>
                </p>
                <p>
                  <strong>Claim Date:</strong>{" "}
                  {new Date(claim.claimDate).toLocaleDateString()}
                </p>
                <div className="sm:col-span-2">
                  <p>
                    <strong>Claim Description:</strong> {claim.description}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Customer Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              <p>
                <strong>Name:</strong>{" "}
                {claim.orderId?.billingAddress?.fullName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {claim.orderId?.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {claim.orderId?.shippingAddress?.phone || "N/A"}
              </p>
              <p>
                <strong>City:</strong>{" "}
                {claim.orderId?.shippingAddress?.city || "N/A"}
              </p>
              <div className="sm:col-span-2">
                <p>
                  <strong>Address:</strong>{" "}
                  {claim.orderId?.shippingAddress?.address || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Iterate over all products in cartItems */}
          {cartItems.map((product, idx) => (
            <div key={idx} className="space-y-6 border-t pt-6">
              {/* Created By */}
              <p className="text-gray-700">
                <strong>Created By:</strong> {product.createdBy || "N/A"}
              </p>

              {/* Policy Details */}
              {product.policy && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                    Policy Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                    <p>
                      <strong>Policy Name:</strong> {product.policy.name}
                    </p>
                    <p>
                      <strong>Insurance Company Name:</strong>{" "}
                      {product.policy.companyName}
                    </p>
                    <p>
                      <strong>Policy Coverage:</strong> {product.policy.coverage}
                    </p>
                    <p>
                      <strong>Policy Price:</strong> ${product.policy.price}
                    </p>
                    <p>
                      <strong>Policy Status:</strong> {product.policy.status}
                    </p>
                    <p>
                      <strong>Duration (days):</strong>{" "}
                      {product.policy.durationDays}
                    </p>
                  </div>
                </section>
              )}

              {/* Product Details */}
              <section>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex justify-center">
                    {product.image ? (
                      <motion.img
                        src={
                          product.image.startsWith("http")
                            ? product.image
                            : `${IMAGE_URL}${product.image}`
                        }
                        alt={product.name}
                        className="w-56 h-45 object-cover rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                          setFullscreenImage(
                            product.image.startsWith("http")
                              ? product.image
                              : `${IMAGE_URL}${product.image}`
                          )
                        }
                      />
                    ) : (
                      <p className="text-gray-500">
                        No product image available.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>Product Name:</strong> {product.name || "N/A"}
                    </p>
                    <p>
                      <strong>Color:</strong>{" "}
                      {product.product_color?.join(", ") || "N/A"}
                    </p>
                    <p>
                      <strong>Size:</strong>{" "}
                      {product.product_size?.join(", ") || "N/A"}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {product.quantity || 0}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ${claim.orderId?.total}
                    </p>
                  </div>
                </div>

                {/* Lens & Enhancement */}
                <section className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
                    Lens & Enhancement
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                    <p>
                      <strong>Lens Type:</strong>{" "}
                      {product.lens?.lens?.lensType?.name ||
                        product.lens?.selectedLens ||
                        "N/A"}
                    </p>
                    <p>
                      <strong>Prescription Method:</strong>{" "}
                      {product.lens?.lens?.prescriptionMethod || "N/A"}
                    </p>
                    <p>
                      {(product.lens?.lens?.prescription?.fileName) && (
                        <div className="mt-4">
                          <strong>Prescription:</strong>{" "}
                          <a
                            href={
                              product.lens.lens.prescription.fileName.startsWith("http" || "https")
                                ? product.lens.lens.prescription.fileName
                                : product.lens.lens.prescription.fileURL
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-3 py-1 font-bold text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                          >
                            View
                          </a>
                        </div>
                      )}
                    </p>
                    <p>
                      <strong>Enhancement:</strong> <br />
                      Name: {product.lens?.lens?.enhancement.name || "None"}
                      <br />
                      Description:{" "}
                      {product.lens?.lens?.enhancement.description || "None"}
                      <br />
                      Discount:{" "}
                      {product.lens?.lens?.enhancement.discount || "None"}
                      <br />
                      Old Price:{" "}
                      {product.lens?.lens?.enhancement.oldPrice || "None"}
                      <br />
                      Price: {product.lens?.lens?.enhancement.price || "None"}
                      <br />
                      Benifites:{" "}
                      {product.lens?.lens?.enhancement.benefits.map(
                        (item, idx) => (
                          <span key={idx}>
                            {idx + 1} : {item} <br />{" "}
                          </span>
                        )
                      ) || "None"}
                      <br />
                    </p>
                    <p>
                      <strong>Thickness:</strong>{" "}
                      {product.thickness?.name || "Standard"}
                    </p>
                  </div>
                </section>
              </section>
            </div>
          ))}

          {/* Uploaded Photos */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Uploaded Photos
            </h3>
            <div className="flex gap-4 overflow-x-auto">
              {claim.photos?.length > 0 ? (
                claim.photos.map((photo, idx) => (
                  <motion.img
                    key={idx}
                    src={`${IMAGE_URL}${photo}`}
                    alt={`Claim Photo ${idx + 1}`}
                    className="w-40 h-36 object-cover rounded-lg shadow hover:scale-105 transition-transform cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFullscreenImage(`${IMAGE_URL}${photo}`)}
                  />
                ))
              ) : (
                <p className="text-gray-500">No photos uploaded.</p>
              )}
            </div>
          </section>
        </motion.div>
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Full View"
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl"
          />
          <button
            className="absolute top-6 right-8 text-white text-4xl hover:text-red-500 hover:cursor-pointer"
            onClick={() => setFullscreenImage(null)}
          >
            &times;
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClaimDetails;
