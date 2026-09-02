import { useEffect, useState } from "react";
import API from "../../API/Api";
import Swal from "sweetalert2";
import { FaPlus, FaTrash } from "react-icons/fa";

const AdminPolicyManager = () => {
  const [pages, setPages] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPageList = async () => {
    try {
      const { data } = await API.get("/admin/policy");
      setPages(data.pages || []);
      if (!selectedSlug && data.pages?.length) {
        setSelectedSlug(data.pages[0].slug);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load policy pages list", "error");
    }
  };

  const fetchPage = async (slug) => {
    if (!slug) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/policy/${slug}`);
      setPageTitle(data.page.pageTitle || "");
      setIntro(data.page.intro || "");
      setSections(data.page.sections || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load page content", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPageList(); }, []);
  useEffect(() => { fetchPage(selectedSlug); }, [selectedSlug]);

  const updateSection = (idx, field, value) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: value };
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { heading: "", body: "" }]);
  };

  const removeSection = (idx) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const moveSection = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= sections.length) return;
    const updated = [...sections];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setSections(updated);
  };

  const handleSave = async () => {
    if (!pageTitle.trim()) {
      Swal.fire("Missing Title", "Page title is required.", "warning");
      return;
    }

    const emptyIndex = sections.findIndex(
      (s) => !s.heading?.trim() || !s.body?.trim()
    );
    if (emptyIndex !== -1) {
      Swal.fire(
        "Empty Section",
        `Section #${emptyIndex + 1} has a blank heading or body. Fill it in or remove it before saving.`,
        "warning"
      );
      return;
    }

    const cleanedSections = sections.map((s) => ({
      heading: s.heading.trim(),
      body: s.body.trim(),
    }));

    try {
      setSaving(true);
      await API.put(`/admin/policy/${selectedSlug}`, {
        pageTitle,
        intro,
        sections: cleanedSections,
      });
      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Page updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchPageList();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to save page", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Manage Legal & Policy Pages</h2>

      {/* Page selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Page</label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full border rounded-lg p-2 text-sm"
        >
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>{p.pageTitle}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 rounded-full border-4 border-[#f00000] border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* Page title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Intro (optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intro Paragraph <span className="text-gray-400">(optional, HTML allowed)</span>
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              className="w-full border rounded-lg p-2 text-sm font-mono"
            />
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Sections</h3>
              <button
                onClick={addSection}
                className="flex items-center gap-1 text-sm bg-[#f00000] text-white px-3 py-1.5 rounded-lg hover:bg-red-700"
              >
                <FaPlus size={12} /> Add Section
              </button>
            </div>

            {sections.map((section, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-400">#{idx + 1}</span>
                  <div className="flex gap-2">
                    <button onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="text-xs px-2 py-1 border rounded disabled:opacity-30">↑</button>
                    <button onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="text-xs px-2 py-1 border rounded disabled:opacity-30">↓</button>
                    <button onClick={() => removeSection(idx)} className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">
                      <FaTrash size={11} />
                    </button>
                  </div>
                </div>

                <label className="block text-xs font-medium text-gray-600 mb-1">Heading</label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateSection(idx, "heading", e.target.value)}
                  className="w-full border rounded p-2 text-sm mb-3"
                />

                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Body <span className="text-gray-400">(HTML allowed — e.g. &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;)</span>
                </label>
                <textarea
                  value={section.body}
                  onChange={(e) => updateSection(idx, "body", e.target.value)}
                  rows={5}
                  className="w-full border rounded p-2 text-sm font-mono"
                />
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg text-white font-semibold ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPolicyManager;