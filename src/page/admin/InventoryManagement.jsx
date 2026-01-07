import { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const InventoryManagement = ({ role = "admin" }) => {

  const user = JSON.parse(localStorage.getItem("user"));
  const vendorId = user?._id;

  // ─────────────────────────────
  // STATES
  // ─────────────────────────────
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const [productId, setProductId] = useState("");
  const [eastQty, setEastQty] = useState("");
  const [westQty, setWestQty] = useState("");
  const [eastChecked, setEastChecked] = useState(false);
  const [westChecked, setWestChecked] = useState(false);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationFilter, setLocationFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change if you want

  const [historyPopup, setHistoryPopup] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      searchProducts(searchTerm);
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchProductHistory = async (productId, location) => {
    try {
      setHistoryLoading(true);

      const { data } = await API.get(
        `/inventory/history/${productId}?location=${location}`
      );
      setSelectedProductHistory(data.history || []);
      setHistoryPopup(true);
    } catch (err) {
      Swal.fire("Error", "Failed to load product history", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ─────────────────────────────
  // FETCH PRODUCTS (FOR DROPDOWN)
  // ─────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await API.get("/getAllproduct");

      const filtered = (res.data.products || []).filter(p => {
        if (role === "admin")
          return p.productStatus === "Approved" && p.createdBy === "admin";

        if (role === "vendor")
          return p.productStatus === "Approved" && p.createdBy === "vendor" && p.vendorID === vendorId;

        return false;
      });

      setProducts(filtered);
    };

    fetchProducts();
  }, []);

  const searchProducts = async (term) => {
    if (!term.trim()) {
      // fallback to all products
      const res = await API.get("/getAllproduct");
      setProducts(res.data.products || []);
      return;
    }

    try {
      setSearchLoading(true);

      const { data } = await API.get(
        `/products/search?search=${encodeURIComponent(term)}`
      );

      setProducts(data.products || []);
    } catch (err) {
      Swal.fire("Error", "Failed to search products", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  // ─────────────────────────────
  // FETCH INVENTORY LIST
  // ─────────────────────────────
  const fetchInventory = async () => {
    try {
      const res = await API.get(
        role === "admin"
          ? "/inventory/get-inventory?createdBy=admin"
          : `/inventory/get-inventory?vendorId=${vendorId}`
      );

      setInventoryList(res.data.inventory || []);
    } catch (err) {
      Swal.fire("Failed", "Failed to fetch inventory", "error");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);


  // ─────────────────────────────
  // ADD STOCK HANDLER
  // ─────────────────────────────
  const handleAddStock = async () => {
    if (!productId) {
      Swal.fire("Required", "Please select a product", "warning");
      return;
    }

    if (!eastChecked && !westChecked) {
      Swal.fire(
        "Required",
        "Please select at least one location (East or West)",
        "warning"
      );
      return;
    }

    if (eastChecked && (!eastQty || Number(eastQty) <= 0)) {
      Swal.fire(
        "Required",
        "Please enter a valid quantity for East",
        "warning"
      );
      return;
    }

    if (westChecked && (!westQty || Number(westQty) <= 0)) {
      Swal.fire(
        "Required",
        "Please enter a valid quantity for West",
        "warning"
      );
      return;
    }

    try {
      setLoading(true);

      if (eastChecked) {
        await API.post("/inventory/add-stock", {
          productId,
          location: "east",
          quantity: Number(eastQty),
          vendorId: role === "vendor" ? vendorId : undefined
        });
      }

      if (westChecked) {
        await API.post("/inventory/add-stock", {
          productId,
          location: "west",
          quantity: Number(westQty),
          vendorId: role === "vendor" ? vendorId : undefined
        });
      }

      Swal.fire("Success", "Stock added successfully", "success");

      setProductId("");
      setEastQty("");
      setWestQty("");
      setEastChecked(false);
      setWestChecked(false);
      setShowAddPopup(false);

      fetchInventory();
    } catch (err) {
      Swal.fire(
        "Failed",
        err.response?.data?.message || "Failed to add stock",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────
  // HELPERS
  // ─────────────────────────────
  const isLowStock = (item) => {
    const totalAvailable =
      (item.rawStock || 0) +
      (item.inProcessing || 0) +
      (item.finishedStock || 0) -
      (item.orderedStock || 0);

    return totalAvailable <= 5;
  };

  const filteredInventory =
    locationFilter === "all"
      ? inventoryList
      : inventoryList.filter((item) => item.location === locationFilter);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const moveToProcessing = async (inventoryId) => {
    try {
      await API.post("/inventory/move-to-processing", {
        inventoryId,
        quantity: 1,
        vendorId: role === "vendor" ? vendorId : undefined
      });
      fetchInventory();
    } catch (err) {
      Swal.fire(
        "Failed",
        err.response?.data?.message || "Failed to move to processing",
        "error"
      );
    }
  };

  const moveToFinished = async (inventoryId, location) => {
    try {
      await API.post("/inventory/move-to-finished", {
        inventoryId,
        quantity: 1,
        location,
        vendorId: role === "vendor" ? vendorId : undefined
      });
      fetchInventory();
    } catch (err) {
      Swal.fire(
        "Failed",
        err.response?.data?.message || "Failed to move to finished",
        "error"
      );
    }
  };

  const getProductImage = (p) => {
    return p?.product_variants?.[0]?.images?.[0]
      ? IMAGE_URL + p.product_variants[0].images[0]
      : null;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [locationFilter, inventoryList]);

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Inventory Management</h2>

        <button
          onClick={() => setShowAddPopup(true)}

          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Stock
        </button>
      </div>

      {/* LOCATION FILTER */}
      <div className="flex gap-3 mb-4">
        {["all", "east", "west"].map((loc) => (
          <button
            key={loc}
            onClick={() => setLocationFilter(loc)}
            className={`px-3 py-1 rounded capitalize ${locationFilter === loc ? "bg-black text-white" : "border"
              }`}
          >
            {loc}
          </button>
        ))}
      </div>

      {/* INVENTORY TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-black text-white">
            <tr>
              <th className="border p-2">Product Image</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Item Code</th>
              <th className="border p-2 text-blue-600">Raw</th>
              <th className="border p-2 text-purple-600">Ordered</th>
              <th className="border p-2 text-yellow-600">Processing</th>
              <th className="border p-2 text-green-600">Finished</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Product History</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item) => (
              <tr
                key={item._id}
                className={isLowStock(item) ? "bg-red-50" : ""}
              >
                <td className="border p-2 text-center">
                  {(() => {
                    // Always resolve full product from list
                    const product = products.find(
                      (p) => p._id === (item.productId?._id || item.productId)
                    );

                    const img = getProductImage(product);

                    return img ? (
                      <img
                        src={img}
                        alt="product"
                        className="w-full h-12 object-cover mx-auto rounded"
                      />
                    ) : (
                      "No Image"
                    );
                  })()}
                </td>

                <td className="border text-center p-2">
                  {item.productId?.product_name || "—"}
                </td>
                <td className="border text-center p-2 capitalize">
                  {item.location}
                </td>
                <td className="border text-center p-2 text-sm">
                  {item.itemCode}
                </td>
                <td className="border p-2 text-center text-blue-600 font-medium">
                  {item.rawStock}
                </td>
                <td className="border p-2 text-center text-purple-600 font-medium">
                  {item.orderedStock || 0}
                </td>
                <td className="border p-2 text-center text-yellow-600 font-medium">
                  {item.inProcessing}
                </td>
                <td className="border p-2 text-center text-green-600 font-medium">
                  {item.finishedStock}
                </td>
                <td className="border p-2 font-medium text-center">
                  {(() => {
                    const usableFinished =
                      (item.finishedStock || 0) - (item.orderedStock || 0);

                    if (usableFinished > 0) return "Ready";

                    if (item.orderedStock > 0) return "Ordered";

                    if (item.inProcessing > 0) return "With Lab";

                    {
                      /* if (item.rawStock > 0) return "Raw"; */
                    }
                    if (item.finishedStock > 0) return "Finished";
                    if (item.inProcessing > 0) return "Processing";
                    if (item.orderedStock > 0) return "Ordered";
                    if (item.rawStock > 0) return "Raw";
                    return "Out";
                  })()}
                </td>

                <td className="border p-2 text-center">
                  {(() => {
                    const isGlasses =
                      String(item.category).toLowerCase() === "glasses";

                    if (!isGlasses) {
                      return (
                        <span className="text-gray-800 text-sm">
                          Auto Managed
                        </span>
                      );
                    }

                    return (
                      <>
                        {item.orderedStock > 0 && (
                          <button
                            onClick={() => moveToProcessing(item._id)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs mr-2"
                          >
                            Send to Lab
                          </button>
                        )}

                        {item.inProcessing > 0 && (
                          <button
                            onClick={() =>
                              moveToFinished(item._id, item.location)
                            }
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Mark Finished
                          </button>
                        )}

                        {item.finishedStock - item.orderedStock > 0 && (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-sm ml-2">
                            Completed
                          </span>
                        )}
                      </>
                    );
                  })()}
                </td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() =>
                      fetchProductHistory(item.productId?._id, item.location)
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}

            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center p-4">
                  No inventory found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border px-3 py-1 rounded disabled:opacity-40"
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="border px-3 py-1 rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ADD STOCK POPUP */}
      {showAddPopup && (
        <div className="fixed inset-2 backdrop-blur bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[700px] relative  border border-gray-300">
            <button
              onClick={() => setShowAddPopup(false)}
              className="absolute top-2 right-3 text-xl"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Stock</h3>

              <input
                type="text"
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="border px-3 py-1 mr-5 rounded w-50 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* PRODUCT SELECT */}
            <div className="mb-4 border rounded">
              <button
                type="button"
                className="w-full flex items-center justify-between p-2"
              >
                {productId ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={getProductImage(
                        products.find((p) => p._id === productId)
                      )}
                      className="w-20 h-15 object-contain rounded"
                    />
                    <span>
                      {products.find((p) => p._id === productId)?.product_name}
                    </span>
                  </div>
                ) : (
                  <span>Select Product</span>
                )}
              </button>

              <div className="max-h-60 overflow-y-auto border-t">
                {searchLoading ? (
                  <p className="p-3 text-sm text-gray-500">Searching…</p>
                ) : products.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">No products found</p>
                ) : (
                  products.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setProductId(p._id)}
                      className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100 ${productId === p._id ? "bg-gray-200" : ""
                        }`}
                    >
                      <img
                        src={getProductImage(p)}
                        className="w-15 h-10 object-contain rounded"
                      />
                      <span>{p.product_name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* EAST */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={eastChecked}
                onChange={(e) => setEastChecked(e.target.checked)}
              />
              <span>East</span>
              {eastChecked && (
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Quantity"
                  value={eastQty}
                  onChange={(e) => setEastQty(e.target.value)}
                  className={`border p-1 rounded w-32 ${!eastQty || Number(eastQty) <= 0 ? "border-red-500" : ""
                    }`}
                />
              )}
            </div>

            {/* WEST */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={westChecked}
                onChange={(e) => setWestChecked(e.target.checked)}
              />
              <span>West</span>
              {westChecked && (
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Quantity"
                  value={westQty}
                  onChange={(e) => setWestQty(e.target.value)}
                  className={`border p-1 rounded w-32 ${!westQty || Number(westQty) <= 0 ? "border-red-500" : ""
                    }`}
                />
              )}
            </div>

            <button
              onClick={handleAddStock}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded w-full"
            >
              {loading ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </div>
      )}

      {/* inventory history popup */}

      {historyPopup && (
        <div className="fixed inset-2 backdrop-blur bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white w-[700px] max-h-[80vh] rounded shadow overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Inventory History</h3>
              <button
                onClick={() => setHistoryPopup(false)}
                className="text-xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto">
              {historyLoading ? (
                <p>Loading...</p>
              ) : selectedProductHistory.length === 0 ? (
                <p className="text-center text-gray-500">No history found</p>
              ) : (
                <table className="w-full border text-sm">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="border p-2">Action</th>
                      <th className="border p-2">Quantity</th>
                      <th className="border p-2">Location</th>
                      <th className="border p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProductHistory.map((h) => (
                      <tr key={h._id}>
                        <td className="border p-2 capitalize">
                          {h.action.replaceAll("_", " ")}
                        </td>
                        <td className="border p-2 text-center">{h.quantity}</td>
                        <td className="border p-2 text-center capitalize">
                          {h.location}
                        </td>
                        <td className="border p-2 text-center">
                          {new Date(h.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
