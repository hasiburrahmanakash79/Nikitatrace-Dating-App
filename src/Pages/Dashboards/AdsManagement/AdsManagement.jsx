import { useEffect, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';
import useFetch from "../../../lib/useFetch";
import useDelete from "../../../lib/useDelete";
import useForm from "../../../lib/useForm";
import { fetchAdUrl, createAddUrl, editAdUrl, deleteAdUrl } from "../../../../endpoints";
import Loading from "../../../components/Common/Loading";
import CommonModal from "../../../components/Common/CommonModal";

const AdsManagement = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [adData, setAdData] = useState({});
  const [currentAd, setCurrentAd] = useState(null)

  const { data, loading } = useFetch(fetchAdUrl);
  const { postResource, loading: submitting } = useForm();
  const { deleteResource } = useDelete();

  useEffect(() => {
    if (data?.title) {
      setAdData(data);
      setCurrentAd(data)
      setPreviewImage(typeof data.banner === "string" ? data.banner : null);
    }
  }, [data]);

  function isValidUrl(string) {
    try {
      new URL(string);
      console.log("link is", string)
      return true;
    } catch (_) {
      return false;
    }
  }

  const validateForm = () => {
    const tempErrors = {};
    if (!adData.title?.trim()) tempErrors.title = "Title is required";
    if (!adData.company?.trim()) tempErrors.company = "Company name is required";
    if (!adData.link?.trim()) tempErrors.link = "Link is required";
    if (!adData.start_date) tempErrors.start_date = "Start date is required";
    if (!adData.end_date) tempErrors.end_date = "End date is required";
    if (!adData.banner && !previewImage) tempErrors.banner = "Banner image is required";
    if (!adData.note?.trim()) tempErrors.note = "Note is required";
    if(adData.link && !isValidUrl(adData.link)) {
      tempErrors.link = "Invalid Url"
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (event, action) => {
    event.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", adData.title);
    formData.append("company", adData.company);
    formData.append("link", adData.link);
    formData.append("start_date", adData.start_date);
    formData.append("end_date", adData.end_date);
    formData.append("note", adData.note);
    if (adData.banner instanceof File) formData.append("banner", adData.banner);

    try {
      const url = action === "add" ? createAddUrl : editAdUrl;
      const result = await postResource(url, formData);
      setAdData(result);
      setCurrentAd(result);
      setPreviewImage(null);
      setIsAddModalOpen(false);
      toast.success(action === "edit" ? "Successfully updated!" : "New advertisement created successfully", {
        duration: 2000,
        position: "top-right",
      });
    } catch (err) {
      console.error("Ad submission failed:", err);
    }
  };

  const handleDelete = () => {
    try {
      deleteResource(deleteAdUrl(adData.id));
      setIsDeleteModalOpen(false);
      // setAdData({ id: "", title: "", company: "", link: "", banner: "", start_date: "", end_date: "", note: "" });
      setAdData({});
      setCurrentAd(null)
      toast.success("Advertisement deleted successfully!", {
        duration: 2000,
        position: "top-right",
      });
    } catch (error) {
      toast.error("Failed to delete advertisement!");
      console.error(error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setAdData({ ...adData, banner: file });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
    <h1 className="text-3xl font-bold text-gray-800 mb-8">Ads Management</h1>
      <Toaster />
      {loading ? (
        <Loading />
      ) : (
        <div className="p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between mb-5">
            <h1 className="text-2xl font-semibold">Your Ad</h1>
            <button
              onClick={() => {
                setErrors({});
                setIsAddModalOpen(true);
              }}
              className="py-2 px-5 bg-[#CE8B38] rounded-xl hover:shadow-2xl text-white"
            >
              {currentAd ? "+ Update" : "Add"}
            </button>
          </div>
          {currentAd ? (
            <>
              <div className="flex gap-8 items-start p-4 rounded-lg shadow-sm">
                <ul className="flex-1 list-inside space-y-2 text-gray-700">
                  <li><strong>Title:</strong> {currentAd.title}</li>
                  <li><strong>Company:</strong> {currentAd.company}</li>
                  <li>
                    <strong>Link:</strong>{" "}
                    <a href={currentAd.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {currentAd.link}
                    </a>
                  </li>
                  <li><strong>Start Date:</strong> {currentAd.start_date}</li>
                  <li><strong>End Date:</strong> {currentAd.end_date}</li>
                  <li><strong>Note:</strong> {currentAd.note}</li>
                </ul>
                {currentAd.banner && (
                  <div className="w-56 h-56 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                    <img src={currentAd.banner} alt="Ad Banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-7 flex justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="py-2 px-5 bg-[#CE8B38] rounded-xl hover:shadow-2xl text-white"
                >
                  Delete Ads
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">No ad found. Please add one.</p>
          )}

          {/* Add/Edit Modal */}
          <CommonModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            title={currentAd ? "Edit Ad" : "Add New Ad"}
          >
            <form onSubmit={(event) => handleSubmit(event, currentAd ? "edit" : "add")} encType="multipart/form-data">
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-full h-40 border-2 border-dashed border-[#D4A017] rounded-lg mb-4 relative">
                    {currentAd ? (
                      <img src={previewImage} alt="Ad Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <p className="text-gray-500 text-center mt-16">+ Select Image</p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      name="banner"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {errors.banner && <p className="text-red-500 text-sm mt-1">{errors.banner}</p>}
                </div>
                <input
                  type="text"
                  value={adData.title || ""}
                  onChange={(e) => setAdData({ ...adData, title: e.target.value })}
                  placeholder="Give your title"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                <input
                  type="text"
                  value={adData.company || ""}
                  onChange={(e) => setAdData({ ...adData, company: e.target.value })}
                  placeholder="Give your company name"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                <input
                  type="text"
                  value={adData.link || ""}
                  onChange={(e) => setAdData({ ...adData, link: e.target.value })}
                  placeholder="Give your link"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.link && <p className="text-red-500 text-sm mt-1">{errors.link}</p>}
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={adData.start_date || ""}
                    onChange={(e) => setAdData({ ...adData, start_date: e.target.value })}
                    placeholder="mm/dd/yyyy"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="date"
                    value={adData.end_date || ""}
                    onChange={(e) => setAdData({ ...adData, end_date: e.target.value })}
                    placeholder="mm/dd/yyyy"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                {(errors.start_date || errors.end_date) && (
                  <p className="text-red-500 text-sm mt-1">Start & End Date is required</p>
                )}
                <input
                  type="text"
                  value={adData.note || ""}
                  onChange={(e) => setAdData({ ...adData, note: e.target.value })}
                  placeholder="Provide note"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.note && <p className="text-red-500 text-sm mt-1">{errors.note}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2 text-white rounded-md ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#D4A017]"}`}
                >
                  {submitting ? (currentAd ? "Updating..." : "Submitting...") : (currentAd ? "Update" : "Submit")}
                </button>
              </div>
            </form>
          </CommonModal>

          {/* Delete Modal */}
          <CommonModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete"
          >
            <div className="space-y-4 text-center">
              <p className="text-lg">Are you sure you want to delete the ad?</p>
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="border border-gray-400 px-4 py-2 rounded-md w-full"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="text-white px-4 py-2 rounded-md bg-[#CE8B38] w-full"
                >
                  Confirm
                </button>
              </div>
            </div>
          </CommonModal>
        </div>
      )}
    </>
  );
};

export default AdsManagement;