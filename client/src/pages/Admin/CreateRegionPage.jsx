import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaSpinner, FaTimes } from "react-icons/fa";
import { IoRocketOutline } from "react-icons/io5";

import Select from "react-select";
import countryList from "react-select-country-list";
import countryFlagEmoji from "country-flag-emoji";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { API_BASE_URL } from '../../config/apiConfig';

// --- CONFIRMATION MODAL COMPONENT (Unchanged) ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  title,
  children,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white/90 backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl shadow-blue-900/20 p-8 border border-white/30 transform transition-all duration-300 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 mb-6">
            <IoRocketOutline className="h-10 w-10 text-[#243670]" />
          </div>
          <h2 className="text-3xl font-bold text-[#243670]">{title}</h2>
          <div className="mt-4 text-slate-600 text-lg">{children}</div>
        </div>
        <div className="mt-10 flex flex-col-reverse sm:flex-row-reverse gap-4">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#243670] text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <span>Confirm</span>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-slate-300 text-slate-600 rounded-lg font-semibold hover:border-[#243670] hover:text-[#243670] transition-all duration-300 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-60"
        >
          <FaTimes size={20} />
        </button>
      </div>
    </div>
  );
};

// NEW: Reusable help text component for URL inputs
const UrlHelpText = () => {
  return (
    <p className="mt-1.5 text-xs text-slate-500">
      Hint: Please provide the full URL starting with{" "}
      <code className="font-semibold text-slate-600">https://</code>
    </p>
  );
};

const CreateRegionPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsapp_sales, setWhatsappSales] = useState("");
  const [whatsapp_support, setWhatsappSupport] = useState("");
  const [social_linkedin, setLinkedin] = useState("");
  const [social_instagram, setInstagram] = useState("");
  const [social_facebook, setFacebook] = useState("");
  const [social_twitter, setTwitter] = useState("");
  const [local_modal_map_src, setMapSrc] = useState("");
  const [email_customer_care, setEmailCustomerCare] = useState("");
  const [email_sales, setEmailSales] = useState("");
  const [email_business, setEmailBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const countryOptions = useMemo(() => countryList().getData(), []);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setPhone("");
    setWhatsapp("");
    setWhatsappSales("");
    setWhatsappSupport("");
  };



const handleConfirmCreation = async () => {
  setIsSubmitting(true);
  setMessage("");

  const token = localStorage.getItem("adminToken");


  const payload = {
    name: selectedCountry.label,
    code: selectedCountry.label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    country_flag: countryFlagEmoji.get(selectedCountry.value).emoji,
    address: address.split("\n").filter((line) => line.trim() !== ""),
    phone,
    whatsapp,
    whatsapp_sales,
    whatsapp_support,
    social_linkedin,
    social_instagram,
    social_facebook,
    social_twitter,
    local_modal_map_src,
    email_customer_care,
    email_sales,
    email_business,
  };

  try {

    const url = `${API_BASE_URL}/regions`;


    const authHeader = token ? `Bearer ${token}` : '';


    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      
        "Authorization": authHeader 
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create region.");
    }

    // If successful, navigate to the dashboard.
    navigate("/admin/dashboard");

  } catch (error) {
    setMessage(`Error: ${error.message}`);
    setIsModalOpen(false);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormInvalid) {
      setMessage(
        "Error: Please fill out all mandatory fields (*), including complete phone numbers."
      );
      return;
    }
    setMessage("");
    setIsModalOpen(true);
  };

  const inputClass =
    "w-full bg-slate-50 border-2 border-transparent rounded-lg outline-none transition-all duration-300 placeholder-slate-400 text-[#243670] focus:bg-white focus:border-[#F59E0B] p-3";

  const isFormInvalid =
    !selectedCountry ||
    !address.trim() ||
    phone.length < 7 ||
    whatsapp.length < 7 ||
    whatsapp_sales.length < 7 ||
    whatsapp_support.length < 7;

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        onConfirm={handleConfirmCreation}
        isSubmitting={isSubmitting}
        title="Launch New Region?"
      >
        <p>
          You are about to deploy a new data stream for{" "}
          <span className="font-bold text-[#F59E0B]">
            {selectedCountry?.label || "the selected country"}
          </span>
          .
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Please confirm that all details are correct before proceeding.
        </p>
      </ConfirmationModal>

      <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl shadow-blue-900/10">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-[#243670]">
                Create New Region
              </h1>
              <p className="text-slate-500 mt-2 text-lg">
                Add a new data stream and its content.
              </p>
            </div>
            <div className="space-y-6">
              <fieldset className="border border-slate-300 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-[#243670]">
                  Region Details
                </legend>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Select Country/Region{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={countryOptions}
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="text-lg"
                    placeholder="Search and select a country..."
                  />
                </div>
              </fieldset>
              <fieldset className="border border-slate-300 rounded-lg p-6">
                <legend className="px-2 text-lg font-semibold text-[#243670]">
                  Contact & Content
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Enter full address, one line per line"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass}
                      rows="3"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Phone (General) <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={
                        selectedCountry
                          ? selectedCountry.value.toLowerCase()
                          : "us"
                      }
                      value={phone}
                      onChange={setPhone}
                      placeholder="Enter general phone..."
                      inputClass={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      WhatsApp (General) <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={
                        selectedCountry
                          ? selectedCountry.value.toLowerCase()
                          : "us"
                      }
                      value={whatsapp}
                      onChange={setWhatsapp}
                      placeholder="Enter general WhatsApp..."
                      inputClass={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      WhatsApp (Sales Chat){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={
                        selectedCountry
                          ? selectedCountry.value.toLowerCase()
                          : "us"
                      }
                      value={whatsapp_sales}
                      onChange={setWhatsappSales}
                      placeholder="Enter Sales WhatsApp..."
                      inputClass={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      WhatsApp (Support Chat){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={
                        selectedCountry
                          ? selectedCountry.value.toLowerCase()
                          : "us"
                      }
                      value={whatsapp_support}
                      onChange={setWhatsappSupport}
                      placeholder="Enter Support WhatsApp..."
                      inputClass={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Customer Care Email <span className="font-extrabold text=black">(Also for Req a Quote Form)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="care@example.com"
                      value={email_customer_care}
                      onChange={(e) => setEmailCustomerCare(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Sales Email
                    </label>
                    <input
                      type="email"
                      placeholder="sales@example.com"
                      value={email_sales}
                      onChange={(e) => setEmailSales(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      placeholder="info@example.com"
                      value={email_business}
                      onChange={(e) => setEmailBusiness(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2 border-t pt-6 mt-2">
                    <h3 className="text-md font-semibold text-gray-500 mb-4 text-center">
                      Optional Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/..."
                          value={social_linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          className={inputClass}
                        />
                        <UrlHelpText /> {/* NEW: Added help text */}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/..."
                          value={social_instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className={inputClass}
                        />
                        <UrlHelpText /> {/* NEW: Added help text */}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/..."
                          value={social_facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          className={inputClass}
                        />
                        <UrlHelpText /> {/* NEW: Added help text */}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Twitter URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://twitter.com/..."
                          value={social_twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          className={inputClass}
                        />
                        <UrlHelpText /> {/* NEW: Added help text */}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Local Map Embed Source (URL)
                        </label>
                        <input
                          type="url"
                          placeholder="Google Maps embed URL..."
                          value={local_modal_map_src}
                          onChange={(e) => setMapSrc(e.target.value)}
                          className={inputClass}
                        />
                        <UrlHelpText /> {/* NEW: Added help text */}
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
            {message && (
              <p
                className={`mt-4 font-mono text-sm ${
                  message.startsWith("Error")
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-slate-300 text-slate-600 rounded-lg font-semibold hover:border-[#243670] hover:text-[#243670] transition-all duration-300"
              >
                <FaArrowLeft />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFormInvalid || isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3 bg-[#243670] text-white rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-900/30 hover:bg-blue-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Create Region</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRegionPage;
