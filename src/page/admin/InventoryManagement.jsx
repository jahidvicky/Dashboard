import { useEffect, useState } from "react";
import API, { IMAGE_URL } from "../../API/Api";
import Swal from "sweetalert2";

const InventoryManagement = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const vendorId = user?._id;
  const role = user?.role;

  // ─────────────────────────────
  // STATES
  // ─────────────────────────────
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [historyPopup, setHistoryPopup] = useState(false);
  const [selectedProductHistory, setSelectedProductHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      searchProducts(searchTerm);
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const fetchProductHistory = async (productId) => {
    try {
      setHistoryLoading(true);
      const { data } = await API.get(`/inventory/history/${productId}`);
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
      const res = await API.get("/getAllProduct");
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
      const res = await API.get("/getAllProduct");
      const filtered = (res.data.products || []).filter(p => {
        if (role === "admin")
          return p.productStatus === "Approved" && p.createdBy === "admin";
        if (role === "vendor")
          return p.productStatus === "Approved" && p.createdBy === "vendor" && p.vendorID === vendorId;
        return false;
      });
      setProducts(filtered || []);
      return;
    }
    try {
      setSearchLoading(true);
      const { data } = await API.get(`/products/search?search=${encodeURIComponent(term)}`);
      const filtered = (data.products || []).filter(p => {
        if (role === "admin")
          return p.productStatus === "Approved" && p.createdBy === "admin";
        if (role === "vendor")
          return p.productStatus === "Approved" && p.createdBy === "vendor" && p.vendorID === vendorId;
        return false;
      });
      setProducts(filtered);
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
    if (!quantity || Number(quantity) <= 0) {
      Swal.fire("Required", "Please enter a valid quantity", "warning");
      return;
    }

    try {
      setLoading(true);
      await API.post("/inventory/add-stock", {
        productId,
        quantity: Number(quantity),
        vendorId: role === "vendor" ? vendorId : undefined,
      });

      Swal.fire("Success", "Stock added successfully", "success");

      setProductId("");
      setQuantity("");
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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = inventoryList.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(inventoryList.length / itemsPerPage);

  const moveToProcessing = async (inventoryId) => {
    try {
      await API.post("/inventory/move-to-processing", {
        inventoryId,
        quantity: 1,
        vendorId: role === "vendor" ? vendorId : undefined,
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

  const moveToFinished = async (inventoryId) => {
    try {
      await API.post("/inventory/move-to-finished", {
        inventoryId,
        quantity: 1,
        vendorId: role === "vendor" ? vendorId : undefined,
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
  }, [inventoryList]);

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

      {/* INVENTORY TABLE */}
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <table className="w-full border">
          <thead className="bg-black text-white sticky top-0 z-10">
            <tr>
              <th className="border p-2">Product Image</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Item Code</th>
              <th className="border p-2 text-blue-400">Raw</th>
              <th className="border p-2 text-purple-400">Ordered</th>
              <th className="border p-2 text-yellow-400">Processing</th>
              <th className="border p-2 text-green-400">Finished</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">Product History</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id} className={isLowStock(item) ? "bg-red-50" : ""}>
                <td className="border p-2 text-center">
                  {(() => {
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
                    if (item.finishedStock > 0) return "Finished";
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
                        <span className="text-gray-800 text-sm">Auto Managed</span>
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
                            onClick={() => moveToFinished(item._id)}
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
                    onClick={() => fetchProductHistory(item.productId?._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}

            {inventoryList.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center p-4">
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
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
        <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[600px] relative border border-gray-300">
            <button
              onClick={() => {
                setShowAddPopup(false);
                setProductId("");
                setQuantity("");
                setSearchTerm("");
              }}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border px-3 py-1 mr-5 rounded w-48 text-sm focus:outline-none focus:ring-1 focus:ring-black"
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
                    {getProductImage(products.find((p) => p._id === productId)) && (
                      <img
                        src={getProductImage(products.find((p) => p._id === productId))}
                        className="w-20 h-14 object-contain rounded"
                        alt=""
                      />
                    )}
                    <span>
                      {products.find((p) => p._id === productId)?.product_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">Select Product</span>
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
                      {getProductImage(p) && (
                        <img
                          src={getProductImage(p)}
                          className="w-14 h-10 object-contain rounded"
                          alt=""
                        />
                      )}
                      <span>{p.product_name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* QUANTITY */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`border p-2 rounded w-full focus:outline-none focus:ring-1 focus:ring-black ${quantity !== "" && Number(quantity) <= 0 ? "border-red-500" : ""
                  }`}
              />
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

      {/* INVENTORY HISTORY POPUP */}
      {historyPopup && (
        <div className="fixed inset-0 backdrop-blur bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[700px] max-h-[80vh] rounded shadow overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Inventory History</h3>
              <button onClick={() => setHistoryPopup(false)} className="text-xl">
                ×
              </button>
            </div>

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