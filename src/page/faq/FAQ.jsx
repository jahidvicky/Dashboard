import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";
import API from '../../API/Api'
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";

function FAQ() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'update'
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [faqdata, setfaqdata] = useState([{}]);
  const [currentPage, setCurrentPage] = useState(1);
  const [faqPerPage] = useState(10);


  const indexOfLastProduct = currentPage * faqPerPage;
  const indexOfFirstProduct = indexOfLastProduct - faqPerPage;
  const currentFaqs = faqdata.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(faqdata.length / faqPerPage);

  const handlePageChange = (page) => setCurrentPage(page);


  const handleAddClick = () => {
    setModalType("add");
    setShowModal(true);
  };

  const handleUpdateClick = (faq) => {
    setModalType("update");
    setFormData({
      id: faq._id, // Set the ID for update
      title: faq.title,
      description: faq.description,
      category: faq.category,
    });
    setShowModal(true);
  };


  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/deletefaq/${id}`);
          fetchallfaq();

          Swal.fire({
            title: "Deleted!",
            text: "FAQ deleted successfully!",
            icon: "success",
            timer: 2000,
            // showConfirmButton: false,
            confirmButtonText: "OK"
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: "Error!",
            text: "Something went wrong while deleting.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const fetchallfaq = async () => {
    try {
      const response = await API.get("/getallfaq", {
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${admintoken}`,
        },
      });
      setfaqdata(response.data.faqs);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchallfaq();
  }, []);

  const handleSubmit = async () => {
    try {
      if (modalType === "add") {
        await API.post("/createfaq", formData);
        Swal.fire({
          title: "Success!",
          text: "FAQ created successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
      } else {
        await API.put(`/updatefaq/${formData.id}`, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
        });
        Swal.fire({
          title: "Success!",
          text: "FAQ updated successfully",
          icon: "success",
          confirmButtonText: "OK"
        });
      }
      setFormData({ title: "", description: "", category: "" });
      setShowModal(false);
      fetchallfaq();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="p-4">
        <div className="flex justify-end">
          <button
            onClick={handleAddClick}
            className="bg-green-500 text-white px-3 py-1 text-xl font-semibold rounded-lg mb-4 hover:cursor-pointer flex items-center gap-2"
          >
            <FaPlus /> ADD FAQ
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh] overflow-x-auto w-full border border-gray-200 rounded-lg">
          {/* Header Row (Sticky) */}
          <div className="grid grid-cols-5 gap-x-10 bg-black text-white py-2 px-4 font-semibold sticky top-0 z-10">
            <div className="text-lg">S.NO.</div>
            <div className="text-lg">CATEGORY</div>
            <div className="text-lg">TITLE</div>
            <div className="text-lg">DESCRIPTION</div>
            <div className="text-lg">ACTION</div>
          </div>

          {/* FAQ Rows */}
          {currentFaqs.map((data, index) => (
            <div
              key={data._id || index}
              className="grid grid-cols-5 gap-x-10 items-start border-b border-gray-300 py-2 px-4 bg-white hover:bg-gray-50"
            >
              <div>{index + 1}</div>
              <div>{data.category}</div>
              <div>{data.title}</div>
              <div>
                {expandedIndex === index ? (
                  <>
                    <p>{data.description}</p>
                    <button
                      className="text-red-500 underline text-sm hover:cursor-pointer"
                      onClick={() => setExpandedIndex(null)}
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  <>
                    <p>
                      {data.description?.length > 100
                        ? data.description.substring(0, 10) + "..."
                        : data.description}
                    </p>
                    {data.description?.length > 100 && (
                      <button
                        className="text-red-500 underline text-sm hover:cursor-pointer"
                        onClick={() => setExpandedIndex(index)}
                      >
                        Show More
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateClick(data)}
                  className="bg-blue-500 px-3 py-1 rounded-xl text-white hover:bg-blue-600 hover:cursor-pointer"
                >
                  <RiEdit2Fill className="text-2xl" />
                </button>
                <button
                  className="bg-red-500 px-3 py-1 rounded-xl text-white hover:bg-red-600 hover:cursor-pointer"
                  onClick={() => handleDelete(data._id)}
                >
                  <MdDelete className="text-2xl" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Pagination Buttons */}
      <div className="flex justify-center mt-4 space-x-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded hover:cursor-pointer ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center backdrop-blur-sm justify-center bg-opacity-90 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-4xl hover:cursor-pointer"
            >
              <IoIosCloseCircle />
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {modalType === "add" ? "Add FAQ" : "Update FAQ"}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-700">Category:</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter Category"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter title"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter description"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:cursor-pointer"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FAQ;
