import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import API, { IMAGE_URL } from "../../API/Api";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  { label: "Morning (10am – 1pm)", readyTime: "10:00", closeTime: "13:00" },
  { label: "Afternoon (1pm – 6pm)", readyTime: "13:00", closeTime: "18:00" },
  { label: "Standard (10am – 6pm)", readyTime: "10:00", closeTime: "18:00" },
];

const WAREHOUSE_DISPLAY = "34 Shining Willow Crescent, Brampton, ON";

const LOOMIS_SERVICE_NAMES = {
  DD: "Standard Shipping",
  DE: "Express Shipping",
  D9: "Express by 9AM",
  DN: "Express by 12PM",
};

// ── Service helpers ───────────────────────────────────────────────────────────

/**
 * Returns the service code from wherever it lives on the order object.
 * Uses explicit if-checks (not ||) so empty strings don't short-circuit.
 */
const getServiceCode = (order) => {
  if (!order) return null;
  if (order.shippingServiceType) return order.shippingServiceType;
  if (order.serviceCode) return order.serviceCode;
  if (order.serviceType) return order.serviceType;
  if (order.shippingInfo) {
    if (order.shippingInfo.serviceCode) return order.shippingInfo.serviceCode;
    if (order.shippingInfo.serviceType) return order.shippingInfo.serviceType;
    if (order.shippingInfo.service) return order.shippingInfo.service;
  }
  return null;
};

/**
 * Returns the human-readable service name.
 * Priority: explicit name field → LOOMIS map lookup → raw code → null
 */
const getServiceName = (order) => {
  if (!order) return null;
  if (order.shippingServiceName) return order.shippingServiceName;
  if (order.shippingInfo && order.shippingInfo.serviceName) return order.shippingInfo.serviceName;
  const code = getServiceCode(order);
  if (code && LOOMIS_SERVICE_NAMES[code]) return LOOMIS_SERVICE_NAMES[code];
  if (code) return code;
  return null;
};

// Service style map
const SERVICE_COLORS = {
  express: {
    bg: "bg-amber-50", border: "border-amber-300",
    badge: "bg-amber-100 text-amber-700", icon: "⚡",
    cardBg: "bg-gradient-to-r from-amber-50 to-orange-50",
    cardBorder: "border-amber-300", priceColor: "text-amber-800",
  },
  ground: {
    bg: "bg-blue-50", border: "border-blue-300",
    badge: "bg-blue-100 text-blue-700", icon: "📦",
    cardBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    cardBorder: "border-blue-300", priceColor: "text-blue-800",
  },
  default: {
    bg: "bg-gray-50", border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600", icon: "🚚",
    cardBg: "bg-gradient-to-r from-gray-50 to-slate-50",
    cardBorder: "border-gray-300", priceColor: "text-gray-800",
  },
};

const getServiceStyle = (code) => {
  const c = (code || "").toLowerCase();
  if (c === "de" || c === "d9" || c === "dn" || c.includes("express")) return SERVICE_COLORS.express;
  if (c === "dd" || c.includes("standard") || c.includes("ground") || c.includes("economy")) return SERVICE_COLORS.ground;
  return SERVICE_COLORS.default;
};

const formatExpectedDelivery = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  const datePart = date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} by ${timePart}`;
};

const formatCurrency = (val) =>
  val != null ? `$${Number(val).toFixed(2)}` : null;

const formatPickupDate = (raw) =>
  raw ? raw.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3") : "";

// ── Rates Modal ───────────────────────────────────────────────────────────────

const RatesModal = ({ order, onClose, onConfirm }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const customerCode = getServiceCode(order);
  const customerName = getServiceName(order);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await API.get(`shipping/rates/${order._id}`);
        const fetchedRates = data.rates || [];
        setRates(fetchedRates);
        if (fetchedRates.length > 0) {
          const match = customerCode ? fetchedRates.find((r) => r.serviceCode === customerCode) : null;
          setSelected(match ? match.serviceCode : fetchedRates[0].serviceCode);
        }
      } catch (err) {
        console.error("Failed to fetch rates:", err);
        setError(err.response?.data?.message || "Failed to fetch rates from Loomis. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [order._id, customerCode]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleConfirm = async () => {
    if (!selected) return;
    const rate = rates.find((r) => r.serviceCode === selected);
    setConfirming(true);
    await onConfirm(rate);
    setConfirming(false);
  };

  const selectedRate = rates.find((r) => r.serviceCode === selected);

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Select Shipping Rate</h3>
              <p className="text-purple-200 text-sm mt-0.5">
                Order #{order.orderNumber} — {order.shippingAddress?.city}, {order.shippingAddress?.province}
              </p>
            </div>
            <button onClick={onClose} className="text-purple-200 hover:text-white transition text-xl leading-none">✕</button>
          </div>
          {customerCode && (
            <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 text-sm text-white">
              <span className="text-purple-200">🛒 Customer selected:</span>
              <span className="font-semibold">{customerName}</span>
              <span className="text-purple-300 font-mono text-xs">[{customerCode}]</span>
              {order.shipping != null && order.shipping > 0 && (
                <span className="ml-auto text-purple-200">{formatCurrency(order.shipping)}</span>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="w-8 h-8 border-purple-500 border-t-transparent rounded-full animate-spin block" style={{ borderWidth: 3, borderStyle: "solid" }} />
              <p className="text-gray-500 text-sm">Fetching live rates from Loomis...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm mb-3">{error}</p>
              <button onClick={() => window.location.reload()} className="text-xs text-red-500 underline">Refresh page to retry</button>
            </div>
          )}
          {!loading && !error && rates.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p>No rates returned from Loomis for this shipment.</p>
            </div>
          )}
          {!loading && !error && rates.length > 0 && (
            <div className="space-y-3">
              {rates.map((rate) => {
                const style = getServiceStyle(rate.serviceCode);
                const isSelected = selected === rate.serviceCode;
                const isCustomerChoice = customerCode && rate.serviceCode === customerCode;
                return (
                  <button
                    key={rate.serviceCode}
                    onClick={() => setSelected(rate.serviceCode)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 ${isSelected ? "border-purple-500 bg-purple-50 shadow-md"
                      : isCustomerChoice ? "border-blue-300 bg-blue-50 hover:border-purple-300"
                        : `${style.border} ${style.bg} hover:border-purple-300`
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${isSelected ? "border-purple-500 bg-purple-500" : "border-gray-300"}`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white block" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800 text-sm">
                              {rate.serviceName || LOOMIS_SERVICE_NAMES[rate.serviceCode] || rate.serviceCode}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                              {style.icon} {rate.serviceCode}
                            </span>
                            {isCustomerChoice && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-600 text-white">🛒 Customer's Choice</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                            {rate.transitDays != null && <span>🕐 {rate.transitDays} business day{rate.transitDays !== 1 ? "s" : ""}</span>}
                            {rate.estimatedDelivery && <span>📅 Est. {new Date(rate.estimatedDelivery).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-lg font-bold ${isSelected ? "text-purple-700" : "text-gray-800"}`}>
                          {formatCurrency(rate.totalCharge ?? rate.baseCharge)}
                        </p>
                        {rate.baseCharge != null && rate.totalCharge != null && rate.baseCharge !== rate.totalCharge && (
                          <p className="text-xs text-gray-400">Base: {formatCurrency(rate.baseCharge)}</p>
                        )}
                        {rate.currency && <p className="text-xs text-gray-400">{rate.currency}</p>}
                      </div>
                    </div>
                    {Array.isArray(rate.surcharges) && rate.surcharges.length > 0 && isSelected && (
                      <div className="mt-3 pt-3 border-t border-purple-200 space-y-1">
                        {rate.surcharges.map((s, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-500">
                            <span>{s.name || s.code}</span>
                            <span>{formatCurrency(s.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && !error && rates.length > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            {selectedRate && (
              <div className="mb-3 flex items-center justify-between text-sm text-gray-600 bg-white border rounded-lg px-3 py-2">
                <span>
                  <strong>{selectedRate.serviceName || LOOMIS_SERVICE_NAMES[selectedRate.serviceCode] || selectedRate.serviceCode}</strong>
                  {selectedRate.transitDays != null && ` · ${selectedRate.transitDays} day${selectedRate.transitDays !== 1 ? "s" : ""}`}
                </span>
                <span className="font-bold text-purple-700">{formatCurrency(selectedRate.totalCharge ?? selectedRate.baseCharge)}</span>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={!selected || confirming}
                className={`flex-1 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition ${!selected || confirming ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
              >
                {confirming ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Shipment...</> : "Create Shipment with this Rate"}
              </button>
              <button onClick={onClose} className="px-4 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100 text-sm font-medium transition">Cancel</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const [labelLoading, setLabelLoading] = useState(false);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [cancelPickupLoading, setCancelPickupLoading] = useState(false);
  const [pickupDates, setPickupDates] = useState([]);
  const [pickupDatesLoading, setPickupDatesLoading] = useState(false);
  const [pickupSlot, setPickupSlot] = useState({ date: "", readyTime: "09:00", closeTime: "12:00" });
  const [voidLoading, setVoidLoading] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setError(null);
      const { data } = await API.get(`/order/${id}`);
      setOrder(data.order);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError("Failed to load order. Please refresh the page.");
    }
  }, [id]);

  useEffect(() => { fetchOrderDetails(); }, [fetchOrderDetails]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") closePickupModal(); };
    if (showPickupModal) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showPickupModal]);

  const openPickupModal = async () => {
    setShowPickupModal(true);
    setPickupDatesLoading(true);
    try {
      const { data } = await API.get("shipping/pickup-days");
      setPickupDates(data.days || []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could Not Load Dates", text: "Failed to fetch available pickup dates from Loomis. Please try again.", confirmButtonColor: "#2563eb" });
      setShowPickupModal(false);
    } finally {
      setPickupDatesLoading(false);
    }
  };

  const closePickupModal = () => {
    setShowPickupModal(false);
    setPickupSlot({ date: "", readyTime: "09:00", closeTime: "12:00" });
  };

  const handleCreateShipment = async (selectedRate) => {
    try {
      setShipmentLoading(true);
      const { data } = await API.post(`shipping/create/${order._id}`, {
        serviceCode: selectedRate.serviceCode,
        serviceName: selectedRate.serviceName,
        totalCharge: selectedRate.totalCharge ?? selectedRate.baseCharge,
        currency: selectedRate.currency,
        transitDays: selectedRate.transitDays,
        estimatedDelivery: selectedRate.estimatedDelivery,
      });
      setShowRatesModal(false);
      Swal.fire({
        icon: "success",
        title: "Shipment Created",
        html: `<p>Tracking number: <strong>${data.trackingNumber}</strong></p><p style="margin-top:6px;color:#6b7280;font-size:13px;">Service: ${selectedRate.serviceName || selectedRate.serviceCode}</p>`,
        confirmButtonColor: "#7c3aed",
        timer: 5000,
        timerProgressBar: true,
      });
      await fetchOrderDetails();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Shipment Failed", text: err.response?.data?.message || "Failed to create shipment.", confirmButtonColor: "#7c3aed" });
    } finally {
      setShipmentLoading(false);
    }
  };

  const handleGenerateLabel = async () => {
    if (!order?.shippingInfo?.labelId) return;
    if (isVoided) {
      Swal.fire({ icon: "warning", title: "Shipment Voided", text: "Cannot generate a label for a voided shipment.", confirmButtonColor: "#7c3aed" });
      return;
    }
    try {
      setLabelLoading(true);
      const response = await API.get(`shipping/label/${order.shippingInfo.labelId}`, { responseType: "blob", validateStatus: (s) => s < 500 });
      if (response.status === 410) {
        const json = JSON.parse(await response.data.text());
        Swal.fire({ icon: "warning", title: "Label Unavailable", text: json.message, confirmButtonColor: "#7c3aed" });
        return;
      }
      const blob = new Blob([response.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      const printWindow = window.open("");
      printWindow.document.write(`<html><head><title>Print Label</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh;}img{max-width:100%;max-height:100%;}</style></head><body><img src="${url}" onload="window.print();window.close();" onerror="document.body.innerHTML='<p style=color:red>Label failed to load.</p>';setTimeout(window.close,3000);" /></body></html>`);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Label Failed", text: "Failed to generate label.", confirmButtonColor: "#7c3aed" });
    } finally {
      setLabelLoading(false);
    }
  };

  const handleSchedulePickup = async () => {
    if (!pickupSlot.date) {
      Swal.fire({ icon: "warning", title: "Date Required", text: "Please select a pickup date.", confirmButtonColor: "#2563eb" });
      return;
    }
    try {
      setPickupLoading(true);
      const { data } = await API.post(`shipping/pickup/${order._id}`, { pickupDate: pickupSlot.date, readyTime: pickupSlot.readyTime, closeTime: pickupSlot.closeTime });
      Swal.fire({ icon: "success", title: "Pickup Scheduled", html: `Confirmation: <strong>${data.confirmationNumber}</strong>`, confirmButtonColor: "#2563eb", timer: 5000, timerProgressBar: true });
      closePickupModal();
      await fetchOrderDetails();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Pickup Failed", text: err.response?.data?.message || "Failed to schedule pickup.", confirmButtonColor: "#2563eb" });
    } finally {
      setPickupLoading(false);
    }
  };

  const handleCancelPickup = async () => {
    const confirmed = await Swal.fire({
      icon: "warning", title: "Cancel Pickup?",
      html: `This will cancel confirmation <strong>${order.pickupInfo.confirmationNumber}</strong> with Loomis. You can reschedule after.`,
      showCancelButton: true, confirmButtonText: "Yes, cancel it", cancelButtonText: "Keep it",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!confirmed.isConfirmed) return;
    try {
      setCancelPickupLoading(true);
      await API.delete(`shipping/cancel-pickup/${order._id}`);
      Swal.fire({ icon: "success", title: "Pickup Cancelled", text: "You can now schedule a new pickup.", confirmButtonColor: "#2563eb", timer: 3000 });
      await fetchOrderDetails();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Cancel Failed", text: err.response?.data?.message || "Failed to cancel pickup.", confirmButtonColor: "#dc2626" });
    } finally {
      setCancelPickupLoading(false);
    }
  };

  const handleVoidShipment = async () => {
    if (isVoided) {
      Swal.fire({ icon: "warning", title: "Already Voided", text: "This shipment has already been voided.", confirmButtonColor: "#dc2626" });
      return;
    }
    const confirmed = await Swal.fire({
      icon: "warning", title: "Void Shipment?",
      text: "This will permanently void the shipment with Loomis. This cannot be undone.",
      showCancelButton: true, confirmButtonText: "Yes, void it", cancelButtonText: "Keep it",
      confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280",
    });
    if (!confirmed.isConfirmed) return;
    try {
      setVoidLoading(true); // ADD
      await API.post(`shipping/void/${order._id}`);
      Swal.fire({ icon: "success", title: "Shipment Voided", timer: 3000, confirmButtonColor: "#dc2626" });
      await fetchOrderDetails();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Void Failed", text: err.response?.data?.message || "Failed to void shipment.", confirmButtonColor: "#dc2626" });
    } finally {
      setVoidLoading(false); // ADD
    }
  };

  const handleViewManifest = () => {
    if (!order?.shippingInfo?.manifestNum) return;
    window.open(`/manifest/${order.shippingInfo.manifestNum}`, "_blank");
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <button onClick={fetchOrderDetails} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Retry</button>
      </div>
    );
  }

  if (!order) return <div className="p-6 text-center text-gray-500 text-xl">Loading order details...</div>;

  // ── Derived flags ──────────────────────────────────────────────────────────────

  const lensItems = order.cartItems.filter((item) => item.lens);

  //  Clean — only trust the actual DB flag
  const isVoided = !!(order?.shippingInfo?.voided || order?.shippingInfo?.voidedAt);
  const isOrderCancelled = order?.orderStatus === "Cancelled";

  // Shipment is "active" only if it exists, is not voided, and order isn't cancelled
  const isShipmentCreated = !!order?.shippingInfo?.shipmentId && !isVoided && !isOrderCancelled;
  const isLabelReady = !!order?.shippingInfo?.labelId && !isVoided && !isOrderCancelled;

  const isPickupScheduled = !!order?.pickupInfo?.confirmationNumber;

  const formattedDeliveryDate = formatExpectedDelivery(
    order?.shippingInfo?.finalExpectedDeliveryDate ||
    order?.shippingInfo?.initialExpectedDeliveryDate ||
    order?.shippingInfo?.expectedDeliveryDate
  );

  const selectedDateLabel = pickupDates.find((d) => d.value === pickupSlot.date)?.label;

  // ── Customer shipping — resolved inline, no helper ambiguity ─────────────────
  const custCode = getServiceCode(order);
  const custName = getServiceName(order);
  const custStyle = getServiceStyle(custCode);


  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <motion.div className="p-8 max-w-7xl mx-auto space-y-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
        <Link to="/admin/admin-order" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">Back</Link>
      </div>

      {/* Order Info */}
      <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Information</h2>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Status:</strong> {order.orderStatus}</p>
          {order.deliveryDate && <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleString()}</p>}
          {order.paymentMethod && <p><strong>Payment Method:</strong> {order.paymentMethod}</p>}
          {order.paymentStatus && <p><strong>Payment Status:</strong> {order.paymentStatus}</p>}
          {order.subtotal != null && <p><strong>Subtotal:</strong> {formatCurrency(order.subtotal)}</p>}
          {order.tax != null && <p><strong>Tax:</strong> {formatCurrency(order.tax)}</p>}
          {order.total != null && <p><strong>Total:</strong> {formatCurrency(order.total)}</p>}
          {order.email && <p><strong>Email:</strong> {order.email}</p>}
          {order.location && <p><strong>Location:</strong> {order.location}</p>}
          {order.transactionId && <p><strong>Transaction ID:</strong> {order.transactionId}</p>}
          {order.userId && <p><strong>User ID:</strong> {order.userId}</p>}
        </div>
      </motion.div>

      {/* Shipping & Billing */}
      <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500 grid grid-cols-1 md:grid-cols-2 gap-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        {order.shippingAddress && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Shipping Address</h2>
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
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Billing Address</h2>
            {order.billingAddress.fullName && <p><strong>Name:</strong> {order.billingAddress.fullName}</p>}
            {order.billingAddress.address && <p><strong>Address:</strong> {order.billingAddress.address}</p>}
            {order.billingAddress.city && <p><strong>City:</strong> {order.billingAddress.city}</p>}
            {order.billingAddress.province && <p><strong>Province:</strong> {order.billingAddress.province}</p>}
            {order.billingAddress.country && <p><strong>Country:</strong> {order.billingAddress.country}</p>}
            {order.billingAddress.postalCode && <p><strong>Postal Code:</strong> {order.billingAddress.postalCode}</p>}
          </div>
        )}
      </motion.div>

      {/* Products + Actions */}
      <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Product ID</th>
                <th className="p-3 text-left">Qty</th>
                <th className="p-3 text-left">Price</th>
              </tr>
            </thead>
            <tbody className="text-left">
              {order.cartItems.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <img src={item.image?.startsWith("http") ? item.image : `${IMAGE_URL}/${item.image}`} alt={item.name} className="w-16 h-16 object-contain" />
                  </td>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.productId}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Confirmed service badge */}
        {isShipmentCreated && (order.shippingInfo?.serviceCode || order.shippingInfo?.serviceType) && (
          <div className="mt-4 inline-flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm text-purple-700">
            <span className="font-medium">Shipping Service:</span>
            <span className="font-semibold">
              {order.shippingInfo.serviceName ||
                LOOMIS_SERVICE_NAMES[order.shippingInfo.serviceCode] ||
                LOOMIS_SERVICE_NAMES[order.shippingInfo.serviceType] ||
                order.shippingInfo.serviceCode ||
                order.shippingInfo.serviceType}
            </span>
            <span className="font-mono text-xs text-purple-400">
              [{order.shippingInfo.serviceCode || order.shippingInfo.serviceType}]
            </span>
            {order.shippingInfo.rateCharged != null && (
              <span className="text-purple-500">· {formatCurrency(order.shippingInfo.rateCharged)}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <button
            onClick={() => setShowRatesModal(true)}
            disabled={isShipmentCreated || isOrderCancelled || shipmentLoading}
            className={`px-6 py-2 rounded text-white flex items-center gap-2 ${isOrderCancelled
              ? "bg-gray-400 cursor-not-allowed"
              : isShipmentCreated
                ? "bg-gray-400 cursor-not-allowed"
                : shipmentLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : isVoided
                    ? "bg-amber-600 hover:bg-amber-700"   // ← amber = re-create after void
                    : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            {shipmentLoading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              : isOrderCancelled ? "Order Cancelled"
                : isShipmentCreated ? "Shipment Created"
                  : isVoided ? "↺ Re-create Shipment"   // ← clear label after void
                    : "Create Shipment"}
          </button>

          {isLabelReady && (
            <button onClick={handleGenerateLabel} disabled={labelLoading}
              className={`px-6 py-2 rounded text-white flex items-center gap-2 ${labelLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
              {labelLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating...</> : "Generate Label"}
            </button>
          )}

          {isShipmentCreated && (
            <button onClick={openPickupModal} disabled={isPickupScheduled}
              className={`px-6 py-2 rounded text-white ${isPickupScheduled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              {isPickupScheduled ? "Pickup Booked" : "Schedule Pickup"}
            </button>
          )}

          {isShipmentCreated && !isVoided && !isPickupScheduled && (
            <button
              onClick={handleVoidShipment}
              disabled={voidLoading}
              className={`px-6 py-2 rounded text-white flex items-center gap-2 ${voidLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {voidLoading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Voiding...</>
                : "Void Shipment"
              }
            </button>
          )}

          {order?.shippingInfo?.manifestNum && (
            <button
              onClick={handleViewManifest}
              className="px-6 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              View Manifest
            </button>
          )}

        </div>
      </motion.div>

      {/* Shipment Details */}
      {order.shippingInfo?.trackingNumber && (
        <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-teal-500" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Shipment Details</h2>
            {isVoided
              ? <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Voided</span>
              : <span className="px-3 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700">Active</span>}
          </div>

          {formattedDeliveryDate && !isVoided && (
            <div className="mb-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-teal-600 uppercase tracking-wide font-medium">Expected Delivery</p>
                <p className="text-base font-semibold text-teal-800">{formattedDeliveryDate}</p>
              </div>
            </div>
          )}

          {isVoided && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-600 uppercase tracking-wide font-medium">Shipment Voided</p>
                <p className="text-sm text-red-700">This shipment has been voided. A new shipment must be created to proceed.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
            {(order.shippingInfo.serviceCode || order.shippingInfo.serviceType) && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Service</p>
                <p className="font-semibold text-purple-800">
                  {order.shippingInfo.serviceName ||
                    LOOMIS_SERVICE_NAMES[order.shippingInfo.serviceCode] ||
                    LOOMIS_SERVICE_NAMES[order.shippingInfo.serviceType] ||
                    order.shippingInfo.serviceCode ||
                    order.shippingInfo.serviceType}
                </p>
                <p className="text-xs text-purple-400 font-mono mt-0.5">
                  {order.shippingInfo.serviceCode || order.shippingInfo.serviceType}
                </p>
                {order.shippingInfo.rateCharged != null && (
                  <p className="text-xs text-purple-500 mt-0.5">{formatCurrency(order.shippingInfo.rateCharged)}</p>
                )}
              </div>
            )}
            {order.shippingInfo.courier && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Courier</p>
                <p className="font-semibold text-gray-800">{order.shippingInfo.courier}</p>
              </div>
            )}
            {order.shippingInfo.trackingNumber && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Tracking Number (PIN)</p>
                <p className="font-semibold text-gray-800 font-mono text-sm">{order.shippingInfo.trackingNumber}</p>
              </div>
            )}
            {order.shippingInfo.labelId && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Label ID</p>
                <p className="font-semibold text-gray-800 font-mono text-sm">{order.shippingInfo.labelId}</p>
              </div>
            )}
            {order.shippingInfo.shipmentNumber && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Shipment Number (SIN)</p>
                <p className="font-semibold text-gray-800 font-mono text-sm">{order.shippingInfo.shipmentNumber}</p>
              </div>
            )}
            {order.shippingInfo.weight && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Weight</p>
                <p className="font-semibold text-gray-800">{order.shippingInfo.weight} lbs</p>
              </div>
            )}
            {order.shippingInfo.originPostalCode && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Origin</p>
                <p className="font-semibold text-gray-800">{order.shippingInfo.originPostalCode}{order.shippingInfo.originProvince && `, ${order.shippingInfo.originProvince}`}</p>
              </div>
            )}
            {order.shippingInfo.destinationPostalCode && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Destination</p>
                <p className="font-semibold text-gray-800">{order.shippingInfo.destinationPostalCode}{order.shippingInfo.destinationProvince && `, ${order.shippingInfo.destinationProvince}`}</p>
              </div>
            )}
            {order.shippedAt && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Shipped At</p>
                <p className="font-semibold text-gray-800">{new Date(order.shippedAt).toLocaleString()}</p>
              </div>
            )}
            {order.shippingInfo.voidedAt && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-400 uppercase tracking-wide mb-1">Voided At</p>
                <p className="font-semibold text-red-700">{new Date(order.shippingInfo.voidedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            {isVoided
              ? <span className="text-xs text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Label unavailable — shipment has been voided</span>
              : order.shippingInfo.cachedLabelBase64
                ? <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Label cached — instant print available</span>
                : ""}
          </div>

          {order.shippingInfo.manifestNum && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 uppercase tracking-wide mb-1">Manifest Number</p>
              <p className="font-semibold text-gray-800 font-mono text-sm">
                {order.shippingInfo.manifestNum}
              </p>
            </div>
          )}

        </motion.div>
      )}

      {/* Lens Details */}
      {lensItems.length > 0 && (
        <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-orange-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Lens Details</h2>
          {lensItems.map((item, idx) => {
            const lens = item.lens;
            const prescription = lens?.lens?.prescription;
            const fileUrl = prescription?.fileURL?.startsWith("http") ? prescription.fileURL : `${IMAGE_URL}${prescription?.fileName}`;
            return (
              <motion.div key={idx} className="border rounded-lg p-4 mb-4 hover:shadow-lg transition" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
                {lens?.selectedLens && <h3 className="text-lg font-bold text-gray-800 mb-3">{lens.selectedLens}</h3>}
                <div className="grid grid-cols-2 gap-3 text-gray-700">
                  {lens?.lens?.prescriptionMethod && <p><strong>Prescription Method:</strong> {lens.lens.prescriptionMethod}</p>}
                  {lens?.lens?.lensType?.name && <p><strong>Lens Type:</strong> {lens.lens.lensType.name}</p>}
                  {lens?.lens?.thickness?.name && <p><strong>Thickness:</strong> {lens.lens.thickness.name}</p>}
                  {(lens?.lens?.tint?.name || lens?.lens?.tint) && <p><strong>Tint:</strong> {lens.lens.tint?.name || lens.lens.tint}</p>}
                  {lens?.lens?.enhancement?.name && <p><strong>Enhancement:</strong> {lens.lens.enhancement.name}</p>}
                  {lens?.totalPrice && <p><strong>Total Lens Price:</strong> {formatCurrency(lens.totalPrice)}</p>}
                </div>
                {prescription && (
                  <div className="mt-4">
                    <strong>Prescription: </strong>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-3 py-1 font-bold text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition">View</a>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pickup Info */}
      {order.pickupInfo?.confirmationNumber && (
        <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Pickup Scheduled</h2>
            <button onClick={handleCancelPickup} disabled={cancelPickupLoading}
              className={`px-4 py-1.5 rounded text-sm text-white flex items-center gap-2 ${cancelPickupLoading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}>
              {cancelPickupLoading ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Cancelling...</> : "Cancel Pickup"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <p><strong>Confirmation #:</strong> {order.pickupInfo.confirmationNumber}</p>
            <p><strong>Date:</strong> {formatPickupDate(order.pickupInfo.pickupDate)}</p>
            <p><strong>Window:</strong> {order.pickupInfo.readyTime} – {order.pickupInfo.closeTime}</p>
            {order.pickupInfo.scheduledAt && <p><strong>Booked at:</strong> {new Date(order.pickupInfo.scheduledAt).toLocaleString()}</p>}
          </div>
        </motion.div>
      )}

      {/* Tracking History */}
      {order.trackingHistory?.length > 0 && (
        <motion.div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-indigo-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tracking History</h2>
          {order.trackingHistory.map((track, i) => (
            <div key={i} className="border-b py-2">
              <p><strong>Status:</strong> {track.status}</p>
              <p><strong>Message:</strong> {track.message}</p>
              <p><strong>Date:</strong> {new Date(track.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Schedule Pickup Modal */}
      {showPickupModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50" onClick={closePickupModal}>
          <div className="bg-white rounded-lg shadow-xl w-[600px] p-6 relative" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-gray-800">Schedule Pickup — Order #{order.orderNumber}</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
            {pickupDatesLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 p-2 border rounded">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Fetching available dates from Loomis...
              </div>
            ) : (
              <select className="border p-2 w-full rounded mb-4" value={pickupSlot.date} onChange={(e) => setPickupSlot((prev) => ({ ...prev, date: e.target.value }))}>
                <option value="">— Select a date —</option>
                {pickupDates.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Window</label>
            <div className="flex gap-3 mb-6">
              {TIME_SLOTS.map((slot) => {
                const active = pickupSlot.readyTime === slot.readyTime && pickupSlot.closeTime === slot.closeTime;
                return (
                  <button key={slot.label} onClick={() => setPickupSlot((prev) => ({ ...prev, readyTime: slot.readyTime, closeTime: slot.closeTime }))}
                    className={`flex-1 border rounded py-2 px-3 text-sm transition ${active ? "bg-blue-600 text-white border-blue-600 font-semibold" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                    {slot.label}
                  </button>
                );
              })}
            </div>
            {pickupSlot.date && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
                Loomis will collect from <strong>{WAREHOUSE_DISPLAY}</strong> on <strong>{selectedDateLabel}</strong> between <strong>{pickupSlot.readyTime} – {pickupSlot.closeTime}</strong>.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleSchedulePickup} disabled={pickupLoading || !pickupSlot.date || pickupDatesLoading}
                className={`flex-1 py-2 rounded text-white font-medium flex items-center justify-center gap-2 ${pickupLoading || !pickupSlot.date || pickupDatesLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
                {pickupLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Scheduling...</> : "Confirm Pickup"}
              </button>
              <button onClick={closePickupModal} className="flex-1 py-2 rounded border text-gray-600 hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Rates Modal */}
      <AnimatePresence>
        {showRatesModal && (
          <RatesModal
            order={order}
            onClose={() => setShowRatesModal(false)}
            onConfirm={handleCreateShipment}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminOrderDetails;