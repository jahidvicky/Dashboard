import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";
import { motion } from "framer-motion";

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  const fetchOrderDetails = async () => {
    try {
      const { data } = await API.get(`/order/${id}`);
      setOrder(data.order);
    } catch (err) {
      console.log("Failed to load order:", err);
    }
  };



  useEffect(() => {
    fetchOrderDetails();
  }, [id]);


  if (!order) {
    return (
      <div className="p-6 text-center text-gray-500 text-xl">
        Loading order details...
      </div>
    );
  }


  const lensItems = order.cartItems.filter(item => item.lens);


  return (
    <motion.div
      className="p-8 max-w-7xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order #{order._id}</h1>
        <Link
          to="/admin/admin-order"
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Back
        </Link>
      </div>

      {/* Order Info */}
      <motion.div
        className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Order Information
        </h2>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Status:</strong> {order.orderStatus}</p>

          {order.trackingNumber && (
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
          )}

          {order.deliveryDate && (
            <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleString()}</p>
          )}

          {order.paymentMethod && (
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          )}

          {order.paymentStatus && (
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
          )}

          {order.subtotal && (
            <p><strong>Subtotal:</strong> ${order.subtotal}</p>
          )}

          {order.shipping && (
            <p><strong>Shipping:</strong> ${order.shipping}</p>
          )}

          {order.tax && (
            <p><strong>Tax:</strong> ${order.tax}</p>
          )}

          {order.total && (
            <p><strong>Total:</strong> ${order.total}</p>
          )}

          {order.email && <p><strong>Email:</strong> {order.email}</p>}

          {order.location && (
            <p><strong>Location:</strong> {order.location}</p>
          )}

          {order.transactionId && (
            <p><strong>Transaction ID:</strong> {order.transactionId}</p>
          )}

          {order.userId && (
            <p><strong>User ID:</strong> {order.userId}</p>
          )}

          <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Shipping & Billing Info */}
      <motion.div
        className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500 grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {order.shippingAddress && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Shipping Address
            </h2>

            {order.shippingAddress.fullName && <p><strong>Name:</strong> {order.shippingAddress.fullName}</p>}
            {order.shippingAddress.address && <p><strong>Address:</strong> {order.shippingAddress.address}</p>}
            {order.shippingAddress.city && <p><strong>City:</strong> {order.shippingAddress.city}</p>}
            {order.shippingAddress.province && <p><strong>Province:</strong> {order.shippingAddress.province}</p>}
            {order.shippingAddress.country && <p><strong>Country:</strong> {order.shippingAddress.country}</p>}
            {order.shippingAddress.postalCode && <p><strong>Postal Code:</strong> {order.shippingAddress.postalCode}</p>}
            {order.shippingAddress.phone && <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>}
          </div>
        )}

        {order.billingAddress && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Billing Address
            </h2>

            {order.billingAddress.fullName && <p><strong>Name:</strong> {order.billingAddress.fullName}</p>}
            {order.billingAddress.address && <p><strong>Address:</strong> {order.billingAddress.address}</p>}
            {order.billingAddress.city && <p><strong>City:</strong> {order.billingAddress.city}</p>}
            {order.billingAddress.province && <p><strong>Province:</strong> {order.billingAddress.province}</p>}
            {order.billingAddress.country && <p><strong>Country:</strong> {order.billingAddress.country}</p>}
            {order.billingAddress.postalCode && <p><strong>Postal Code:</strong> {order.billingAddress.postalCode}</p>}
          </div>
        )}
      </motion.div>

      {/* Products Section */}
      <motion.div
        className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Products</h2>

        {order.cartItems.map((item, idx) => (
          <motion.div
            key={idx}
            className="border rounded-lg p-4 mb-4 flex flex-col md:flex-row gap-6 items-start hover:shadow-lg transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
          >
            <img
              src={
                item.image?.startsWith("http")
                  ? item.image
                  : `${IMAGE_URL}/${item.image}`
              }
              alt={item.name}
              className="w-32 h-32 object-contain border rounded"
            />

            <div className="flex-1 space-y-1">
              <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>

              <p><strong>Product ID:</strong> {item.productId}</p>
              <p><strong>Quantity:</strong> {item.quantity}</p>

              <p><strong>Frame Color:</strong> {item.product_color?.join(", ") || "N/A"}</p>
              <p><strong>Size:</strong> {item.product_size?.join(", ") || "N/A"}</p>

              <p><strong>Price:</strong> ${item.price}</p>

              {item.status && (
                <p><strong>Status:</strong> {item.status}</p>
              )}

              {item.policy && (
                <p>
                  <strong>Policy:</strong> {item.policy.name} {" "}
                  {item.policy.coverage} | Status: {item.policy.status}
                  <p>Policy Price: ${item.price}</p>
                  <p>
                    <strong>Insurance Company:</strong> {item.policy?.companyName || "N/A"}
                  </p>
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lens Details Section */}
      {/* <motion.div
        className="bg-white shadow-md rounded-lg p-6 border-l-4 border-orange-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Lens Details</h2>

        {order.cartItems
          .filter((item) => item.lens)
          .map((item, idx) => {
            const lens = item.lens;
            const enhancement = item.enhancement;
            const prescription = lens.lens.prescription;

            const fileUrl =
              prescription?.fileURL?.startsWith("http") ||
                prescription?.fileURL?.startsWith("https")
                ? prescription.fileURL
                : `${IMAGE_URL}${prescription?.fileName}`;

            return (
              <motion.div
                key={idx}
                className="border rounded-lg p-4 mb-4 hover:shadow-lg transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {lens.selectedLens}
                </h3>

                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  <p><strong>Prescription Method:</strong> {lens.lens.prescriptionMethod}</p>
                  <p><strong>Lens Type:</strong> {lens.lens.lensType?.name || "N/A"}</p>
                  <p><strong>Lens Description:</strong> {lens.lens.lensType?.description || "N/A"}</p>
                  <p><strong>Color:</strong> {lens.lens.lensType?.color?.name || "N/A"}</p>
                  <p><strong>Thickness:</strong> {lens.lens.thickness?.name || "N/A"}</p>
                  <p><strong>Tint:</strong> {lens.lens.tint?.name || lens.lens?.tint || "None"}</p>
                  <p><strong>Enhancement:</strong> {lens.lens.enhancement?.name || "None"}</p>

                  {enhancement && (
                    <>
                      <p><strong>Enhancement Description:</strong> {enhancement.description}</p>
                      <p><strong>Benefits:</strong> {enhancement.benefits?.join(", ")}</p>
                      <p><strong>Enhancement Discount:</strong> {enhancement.discount}</p>
                      <p><strong>Enhancement Price:</strong> {enhancement.price}</p>
                      <p><strong>Old Price:</strong> {enhancement.oldPrice}</p>
                    </>
                  )}

                  <p><strong>Total Lens Price:</strong> ${lens.totalPrice || 0}</p>
                </div>

                {prescription && (
                  <div className="mt-4">
                    <strong>Prescription:</strong>{" "}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 font-bold text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                      View
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
      </motion.div> */}

      {lensItems.length > 0 && (
        <motion.div
          className="bg-white shadow-md rounded-lg p-6 border-l-4 border-orange-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            Lens Details
          </h2>

          {lensItems.map((item, idx) => {
            const lens = item.lens;
            const enhancement = item.enhancement;
            const prescription = lens?.lens?.prescription;

            const fileUrl =
              prescription?.fileURL?.startsWith("http")
                ? prescription.fileURL
                : `${IMAGE_URL}${prescription?.fileName}`;

            return (
              <motion.div
                key={idx}
                className="border rounded-lg p-4 mb-4 hover:shadow-lg transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                {lens?.selectedLens && (
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    {lens.selectedLens}
                  </h3>
                )}

                <div className="grid grid-cols-2 gap-3 text-gray-700">

                  {lens?.lens?.prescriptionMethod && (
                    <p><strong>Prescription Method:</strong> {lens.lens.prescriptionMethod}</p>
                  )}

                  {lens?.lens?.lensType?.name && (
                    <p><strong>Lens Type:</strong> {lens.lens.lensType.name}</p>
                  )}

                  {lens?.lens?.lensType?.description && (
                    <p><strong>Description:</strong> {lens.lens.lensType.description}</p>
                  )}

                  {lens?.lens?.lensType?.color?.name && (
                    <p><strong>Color:</strong> {lens.lens.lensType.color.name}</p>
                  )}

                  {lens?.lens?.thickness?.name && (
                    <p><strong>Thickness:</strong> {lens.lens.thickness.name}</p>
                  )}

                  {(lens?.lens?.tint?.name || lens?.lens?.tint) && (
                    <p><strong>Tint:</strong> {lens.lens.tint?.name || lens.lens.tint}</p>
                  )}

                  {lens?.lens?.enhancement?.name && (
                    <p><strong>Enhancement:</strong> {lens.lens.enhancement.name}</p>
                  )}

                  {enhancement?.description && (
                    <p><strong>Enhancement Description:</strong> {enhancement.description}</p>
                  )}

                  {enhancement?.benefits?.length > 0 && (
                    <p><strong>Benefits:</strong> {enhancement.benefits.join(", ")}</p>
                  )}

                  {enhancement?.discount && (
                    <p><strong>Discount:</strong> {enhancement.discount}</p>
                  )}

                  {enhancement?.price && (
                    <p><strong>Enhancement Price:</strong> {enhancement.price}</p>
                  )}

                  {lens?.totalPrice && (
                    <p><strong>Total Lens Price:</strong> ${lens.totalPrice}</p>
                  )}
                </div>

                {prescription && (
                  <div className="mt-4">
                    <strong>Prescription: </strong>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 font-bold text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                    >
                      View
                    </a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}


      {/* Tracking History */}
      {order.trackingHistory?.length > 0 && (
        <motion.div
          className="bg-white shadow-md rounded-lg p-6 border-l-4 border-indigo-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Tracking History
          </h2>

          {order.trackingHistory.map((track, i) => (
            <div key={i} className="border-b py-2">
              <p><strong>Status:</strong> {track.status}</p>
              <p><strong>Message:</strong> {track.message}</p>
              <p><strong>Date:</strong> {new Date(track.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminOrderDetails;
