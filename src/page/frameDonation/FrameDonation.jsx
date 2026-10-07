import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import API, { IMAGE_URL } from "../../API/Api";

dayjs.extend(customParseFormat);

/* ---------------- CONSTANTS & HELPERS ---------------- */

const BRAND_RED = "#f00000";

const STATUS = {
    PENDING: {
        label: "Not requested",
        cls: "bg-yellow-100 text-yellow-700",
    },

    ARRANGED: {
        label: "Pickup scheduled",
        cls: "bg-blue-100 text-blue-700",
    },

    PICKED_UP: {
        label: "Picked up",
        cls: "bg-green-100 text-green-700",
    },

    DELIVERED: {
        label: "Delivered",
        cls: "bg-purple-100 text-purple-700",
    },

    CANCELLED: {
        label: "Cancelled",
        cls: "bg-red-100 text-red-700",
    },

    FAILED: {
        label: "Pickup failed",
        cls: "bg-red-100 text-red-700",
    },
};
const getStatus = (item) => STATUS[item?.pickupStatus] || STATUS.PENDING;

const canArrange = (item) =>
    ["PENDING", "FAILED", undefined, null].includes(item?.pickupStatus);

const formatPickupDate = (d) =>
    d ? dayjs(d, "YYYYMMDD").format("MMM D, YYYY") : "-";

const formatPickupTime = (t) =>
    t && String(t).length === 4
        ? `${String(t).slice(0, 2)}:${String(t).slice(2)}`
        : t || "-";

const formatDateTime = (d) => (d ? dayjs(d).format("MMM D, YYYY h:mm A") : "-");

// normalize images (supports old + new data)
const getImages = (item) => {
    if (Array.isArray(item?.frameImages) && item.frameImages.length > 0) {
        return item.frameImages;
    }
    if (item?.frameImage) return [item.frameImage];
    return [];
};

// SweetAlert helpers
const showLoader = (title, text = "Please wait...") =>
    Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
    });

const Spinner = ({ className = "h-4 w-4" }) => (
    <span
        className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
        aria-hidden="true"
    />
);

const StatusBadge = ({ item }) => {
    const s = getStatus(item);
    return (
        <span
            className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}
        >
            {s.label}
        </span>
    );
};

// One label/value row inside the details table
const DetailRow = ({ label, children }) => (
    <tr>
        <th className="w-44 border border-gray-200 bg-gray-50 p-2 text-left align-top text-sm font-semibold text-gray-700">
            {label}
        </th>
        <td className="border border-gray-200 p-2 text-sm text-gray-900 break-words">
            {children}
        </td>
    </tr>
);

/* ---------------- COMPONENT ---------------- */

const FrameDonation = () => {
    const [donations, setDonations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const [pageLoading, setPageLoading] = useState(true);
    // Which row/button is busy, e.g. "6aba...:arrange" or "6aba...:check"
    const [busy, setBusy] = useState(null);

    useEffect(() => {
        fetchDonations();
    }, []);

    // Stop the page behind from scrolling while the details popup is open
    useEffect(() => {
        if (!selected) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [selected]);

    const isBusy = (id, action) => busy === `${id}:${action}`;
    const rowBusy = (id) => busy?.startsWith(`${id}:`);

    /* ---------- API: list ---------- */

    const fetchDonations = async ({ silent = false } = {}) => {
        try {
            if (!silent) setPageLoading(true);
            const res = await API.get("/community");
            const list = res.data.donations || [];
            setDonations(list);

            // keep the open popup in sync with fresh data
            setSelected((prev) =>
                prev ? list.find((d) => d._id === prev._id) || prev : prev
            );
        } catch (error) {
            console.error("Failed to load donations", error);
            Swal.fire({
                icon: "error",
                title: "Could not load donations",
                text: error?.response?.data?.message || "Please try again.",
                confirmButtonColor: BRAND_RED,
            });
        } finally {
            if (!silent) setPageLoading(false);
        }
    };

    /* ---------- API: arrange pickup ---------- */

    const handleArrangePickup = async (item) => {
        const confirm = await Swal.fire({
            icon: "question",
            title: "Arrange free pickup?",
            html: `Loomis will be booked to collect frames from <b>${item.name}</b>.`,
            showCancelButton: true,
            confirmButtonText: "Arrange pickup",
            confirmButtonColor: BRAND_RED,
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        setBusy(`${item._id}:arrange`);
        showLoader("Arranging pickup", "Contacting Loomis...");

        try {
            const res = await API.post(`/community/${item._id}/arrange-pickup`);
            const updated = res.data.donation;

            setDonations((prev) =>
                prev.map((d) => (d._id === updated._id ? updated : d))
            );
            setSelected((prev) => (prev?._id === updated._id ? updated : prev));

            await Swal.fire({
                icon: "success",
                title: "Pickup scheduled",
                html: `
                    <div style="text-align:left;display:inline-block">
                        <div><b>Confirmation ID:</b> ${updated.loomisConfirmationId || "-"}</div>
                        <div><b>Date:</b> ${formatPickupDate(updated.pickupDate)}</div>
                        <div><b>Window:</b> ${formatPickupTime(updated.pickupReadyTime)} to ${formatPickupTime(updated.pickupCloseTime)}</div>
                    </div>`,
                confirmButtonColor: BRAND_RED,
            });
        } catch (error) {
            console.error("Arrange pickup failed:", error);

            // backend may have saved status FAILED + pickupError, so refresh silently
            fetchDonations({ silent: true });

            await Swal.fire({
                icon: "error",
                title: "Pickup could not be arranged",
                text:
                    error?.response?.data?.message ||
                    "Failed to arrange Loomis pickup.",
                confirmButtonColor: BRAND_RED,
            });
        } finally {
            setBusy(null);
        }
    };

    /* ---------- API: check pickup status ---------- */

    const handleCheckPickupStatus = async (item) => {
        setBusy(`${item._id}:check`);
        showLoader("Checking pickup", "Asking Loomis for the latest status...");

        try {
            const res = await API.get(`/community/${item._id}/pickup-status`);
            await fetchDonations({ silent: true });

            if (res.data.pickupStatus === "DELIVERED") {
                await Swal.fire({
                    icon: "success",
                    title: "Parcel delivered",
                    text: "Loomis has delivered the donated frames to the destination.",
                    confirmButtonColor: BRAND_RED,
                });
            } else if (res.data.pickupStatus === "PICKED_UP") {
                await Swal.fire({
                    icon: "success",
                    title: "Parcel picked up",
                    text: `Picked up on: ${res.data.pickedUpOn
                        ? formatDateTime(res.data.pickedUpOn)
                        : "Available in tracking"
                        }`,
                    confirmButtonColor: BRAND_RED,
                });
            } else {
                await Swal.fire({
                    icon: "info",
                    title: "Not picked up yet",
                    html: `
            <div style="text-align:left;display:inline-block">
                <div>The driver hasn't collected the parcel yet.</div>
                <div style="margin-top:8px">
                    <b>Scheduled:</b>
                    ${formatPickupDate(item.pickupDate)},
                    ${formatPickupTime(item.pickupReadyTime)}
                    to
                    ${formatPickupTime(item.pickupCloseTime)}
                </div>
                <div>
                    <b>Confirmation ID:</b>
                    ${res.data.confirmationId || "-"}
                </div>
            </div>
        `,
                    confirmButtonColor: BRAND_RED,
                });
            }
        } catch (error) {
            console.error("Pickup status check failed:", error);
            await Swal.fire({
                icon: "error",
                title: "Could not check status",
                text:
                    error?.response?.data?.message ||
                    "Unable to check Loomis status.",
                confirmButtonColor: BRAND_RED,
            });
        } finally {
            setBusy(null);
        }
    };

    /* ---------------- UI ---------------- */

    const ArrangeButton = ({ item, className = "" }) => (
        <button
            onClick={() => handleArrangePickup(item)}
            disabled={rowBusy(item._id)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isBusy(item._id, "arrange") && <Spinner />}
            {item.pickupStatus === "FAILED" ? "Retry pickup" : "Arrange pickup"}
        </button>
    );

    const CheckButton = ({ item, className = "" }) => (
        <button
            onClick={() => handleCheckPickupStatus(item)}
            disabled={rowBusy(item._id)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {isBusy(item._id, "check") && <Spinner />}
            Check pickup
        </button>
    );

    const images = getImages(selected);

    return (
        <div className="p-6">
            {/* IMAGE ZOOM MODAL (only closes the zoomed image, never the details popup) */}
            {zoomImage && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
                    onClick={() => setZoomImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] p-4">
                        <img
                            src={zoomImage}
                            alt="Zoomed Frame"
                            className="max-h-[90vh] max-w-full object-contain rounded"
                        />
                        <button
                            onClick={() => setZoomImage(null)}
                            className="absolute top-4 right-6 text-black text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#f00000]">
                    Frame Donations
                </h1>

                <button
                    onClick={() => fetchDonations()}
                    disabled={pageLoading}
                    className="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    {pageLoading && <Spinner />}
                    Refresh
                </button>
            </div>

            {/* LIST TABLE */}
            <div className="overflow-auto max-h-[calc(100vh-210px)] rounded border border-gray-300">
                <table className="w-full table-auto border-collapse">
                    <thead className="text-white">
                        <tr>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-left">Name</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-left">Email</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-left">Phone</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-center">Qty</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-center">Pickup status</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-center">Date</th>
                            <th className="sticky top-0 z-10 bg-black border border-gray-700 p-3 text-center min-w-[270px]">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pageLoading && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-600">
                                    <span className="inline-flex items-center gap-3">
                                        <Spinner className="h-5 w-5" />
                                        Loading donations...
                                    </span>
                                </td>
                            </tr>
                        )}

                        {!pageLoading && donations.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-8 text-center text-gray-600">
                                    No donations found
                                </td>
                            </tr>
                        )}

                        {!pageLoading &&
                            donations.map((item) => (
                                // Clicking anywhere on the row opens that donation's details
                                <tr
                                    key={item._id}
                                    onClick={() => setSelected(item)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") setSelected(item);
                                    }}
                                    tabIndex={0}
                                    className="cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:outline-none"
                                >
                                    <td className="border p-3 text-left">{item.name}</td>
                                    <td className="border p-3 text-left whitespace-nowrap">{item.email}</td>
                                    <td className="border p-3 text-left whitespace-nowrap">{item.phone}</td>
                                    <td className="border p-3 text-center">{item.frameQuantity ?? "-"}</td>

                                    <td className="border p-3 text-center">
                                        <StatusBadge item={item} />
                                    </td>

                                    <td className="border p-3 text-center whitespace-nowrap">
                                        {dayjs(item.createdAt).format("MMM D, YYYY")}
                                    </td>

                                    {/* stopPropagation so clicking a button doesn't also open the popup */}
                                    <td
                                        className="border p-3 cursor-default"
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex flex-nowrap items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelected(item)}
                                                className="whitespace-nowrap rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                            >
                                                View details
                                            </button>

                                            {canArrange(item) && <ArrangeButton item={item} />}

                                            {["ARRANGED", "PICKED_UP"].includes(item.pickupStatus) && (
                                                <CheckButton item={item} />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* DETAILS MODAL
                No click-outside or Escape handler on purpose:
                it stays open until the Close button (or ✕) is clicked. */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Donation details"
                >
                    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
                        {/* Header (always visible) */}
                        <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-[#f00000]">
                                    Donation Details
                                </h2>
                                <StatusBadge item={selected} />
                            </div>

                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-600 hover:text-black text-xl leading-none"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Scrollable body */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {/* Donor + donation details */}
                            <table className="w-full border-collapse">
                                <tbody>
                                    <DetailRow label="Name">{selected.name}</DetailRow>
                                    <DetailRow label="Email">{selected.email}</DetailRow>
                                    <DetailRow label="Phone">{selected.phone}</DetailRow>
                                    <DetailRow label="Address">{selected.address}</DetailRow>
                                    <DetailRow label="Postal code">{selected.postal}</DetailRow>
                                    <DetailRow label="Frame type">{selected.frameType}</DetailRow>
                                    <DetailRow label="Quantity donated">
                                        <span className="font-semibold">
                                            {selected.frameQuantity ?? "Not recorded"}
                                        </span>
                                    </DetailRow>
                                    <DetailRow label="Submitted on">
                                        {formatDateTime(selected.createdAt)}
                                    </DetailRow>
                                </tbody>
                            </table>

                            {/* Images */}
                            <div>
                                <h3 className="mb-2 text-lg font-bold">
                                    Frame images ({images.length})
                                </h3>

                                {images.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No images were uploaded for this donation.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={`${IMAGE_URL}${img}`}
                                                alt={`Frame ${idx + 1}`}
                                                className="h-40 w-full object-contain border rounded cursor-pointer hover:scale-105 transition"
                                                onClick={() => setZoomImage(`${IMAGE_URL}${img}`)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pickup information */}
                            <div>
                                <h3 className="mb-2 text-lg font-bold">Free pickup</h3>

                                <table className="w-full border-collapse">
                                    <tbody>
                                        <DetailRow label="Status">
                                            <StatusBadge item={selected} />
                                        </DetailRow>

                                        {selected.pickupStatus === "FAILED" && selected.pickupError && (
                                            <DetailRow label="Last error">
                                                <span className="text-red-700">{selected.pickupError}</span>
                                            </DetailRow>
                                        )}

                                        {selected.pickupDate && (
                                            <DetailRow label="Pickup date">
                                                {formatPickupDate(selected.pickupDate)},{" "}
                                                {formatPickupTime(selected.pickupReadyTime)} to{" "}
                                                {formatPickupTime(selected.pickupCloseTime)}
                                            </DetailRow>
                                        )}

                                        {selected.loomisEReturnId && (
                                            <DetailRow label="Loomis E-Return ID">
                                                {selected.loomisEReturnId}
                                            </DetailRow>
                                        )}

                                        {selected.loomisShipmentNumber && (
                                            <DetailRow label="Loomis Shipment Number">
                                                {selected.loomisShipmentNumber}
                                            </DetailRow>
                                        )}

                                        {selected.loomisTrackingNumber && (
                                            <DetailRow label="Loomis Tracking / PIN">
                                                {selected.loomisTrackingNumber}
                                            </DetailRow>
                                        )}

                                        {selected.loomisReference && (
                                            <DetailRow label="Loomis Reference">
                                                {selected.loomisReference}
                                            </DetailRow>
                                        )}

                                        {selected.pickedUpOn && (
                                            <DetailRow label="Picked up on">
                                                {formatDateTime(selected.pickedUpOn)}
                                            </DetailRow>
                                        )}

                                        {selected.pickupStatus === "DELIVERED" && (
                                            <DetailRow label="Delivery status">
                                                <span className="font-semibold text-purple-700">
                                                    Delivered
                                                </span>
                                            </DetailRow>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer (always visible) */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {canArrange(selected) && (
                                    <ArrangeButton item={selected} className="px-5 py-2" />
                                )}

                                {["ARRANGED", "PICKED_UP"].includes(selected.pickupStatus) && (
                                    <CheckButton item={selected} className="px-5 py-2" />
                                )}
                            </div>

                            <button
                                onClick={() => setSelected(null)}
                                className="rounded border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FrameDonation;