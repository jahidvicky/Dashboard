import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import API, { IMAGE_URL } from "../../API/Api";

function Review() {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [expanded, setExpanded] = useState({}); // track expanded reviews

  const [formData, setFormData] = useState({
    description: "",
    followers: "",
    frames: "",
    customer: "",
  });
  const [image, setImage] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      const res = await API.get("/getreview");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Add or Update Review
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("description", formData.description);
    data.append("followers", formData.followers);
    data.append("frames", formData.frames);
    data.append("customer", formData.customer);
    if (image) data.append("image", image);

    try {
      if (isEditing) {
        await API.put(`/updatereviews/${currentId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Review updated successfully");
      } else {
        await API.post("/createreviews", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Review added successfully");
      }

      setShowModal(false);
      setFormData({ description: "", followers: "", frames: "", customer: "" });
      setImage(null);
      setIsEditing(false);
      setCurrentId(null);

      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save review");
    }
  };

  // Open modal for editing
  const handleEdit = (review) => {
    setFormData({
      description: review.description,
      followers: review.followers,
      frames: review.frames,
      customer: review.customer,
    });
    setImage(null);
    setCurrentId(review._id);
    setIsEditing(true);
    setShowModal(true);
  };

  // Toggle description expand
  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-4">
      {/* Add Review Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowModal(true);
            setIsEditing(false);
            setFormData({
              description: "",
              followers: "",
              frames: "",
              customer: "",
            });
            setImage(null);
          }}
          className="bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2"
        >
          <FaPlus /> ADD REVIEW
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <div className="grid grid-cols-6 gap-x-6 bg-black text-white py-2 px-4 font-semibold">
          <div className="text-lg">DESCRIPTION</div>
          <div className="text-lg">FOLLOWERS</div>
          <div className="text-lg">FRAMES</div>
          <div className="text-lg">CUSTOMERS</div>
          <div className="text-lg">IMAGE</div>
          <div className="text-lg">ACTION</div>
        </div>

        {reviews.map((review) => {
          const isExpanded = expanded[review._id] || false;
          return (
            <div
              key={review._id}
              className="grid grid-cols-6 gap-x-6 py-2 px-4 border-b items-center"
            >
              <div>
                {isExpanded
                  ? review.description
                  : review.description.slice(0, 20) + (review.description.length > 20 ? "..." : "")}
                {review.description.length > 20 && (
                  <button
                    onClick={() => toggleExpand(review._id)}
                    className="text-red-600 ml-2 hover:underline hover:cursor-pointer"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
              <div>{review.followers}</div>
              <div>{review.frames}</div>
              <div>{review.customer}</div>
              <div>
                {review.image && (
                  <img
                    src={`${IMAGE_URL + review.image}`}
                    alt="review"
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </div>
              <div>
                <button
                  onClick={() => handleEdit(review)}
                  className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 hover:cursor-pointer"
                >
                  <FaEdit /> Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Update Review" : "Add Review"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="followers"
                placeholder="Followers"
                value={formData.followers}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="frames"
                placeholder="Frames"
                value={formData.frames}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="customer"
                placeholder="Customers"
                value={formData.customer}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
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
                  {isEditing ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Review;
