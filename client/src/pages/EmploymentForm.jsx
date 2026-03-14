import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBriefcase, FaGraduationCap, FaCheck, FaFileUpload, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/apiConfig';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Step Components - Moved outside to prevent re-creation on every render
const PersonalInfoStep = ({ formData, errors, handleChange, handlePhoneChange, countries, defaultCountry }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.fullName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full name"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="your.email@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.gender ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nationality <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="nationality"
          value={formData.nationality}
          onChange={handleChange}
          list="nationality-list"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.nationality ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Type or select nationality"
          autoComplete="off"
        />
        <datalist id="nationality-list">
          {countries.map((country) => (
            <option key={country} value={country} />
          ))}
        </datalist>
        {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Contact <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          country={defaultCountry}
          value={formData.mobileContact}
          onChange={(phone) => handlePhoneChange('mobileContact', phone)}
          inputClass={`w-full ${errors.mobileContact ? 'border-red-500' : ''}`}
          containerClass="w-full"
          inputStyle={{ width: '100%', height: '48px', fontSize: '16px' }}
        />
        {errors.mobileContact && <p className="text-red-500 text-sm mt-1">{errors.mobileContact}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        <PhoneInput
          country={defaultCountry}
          value={formData.whatsapp}
          onChange={(phone) => handlePhoneChange('whatsapp', phone)}
          inputClass={`w-full ${errors.whatsapp ? 'border-red-500' : ''}`}
          containerClass="w-full"
          inputStyle={{ width: '100%', height: '48px', fontSize: '16px' }}
        />
        {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="currentAddress"
          value={formData.currentAddress}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.currentAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Street address"
        />
        {errors.currentAddress && <p className="text-red-500 text-sm mt-1">{errors.currentAddress}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.city ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="City"
        />
        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="country"
          value={formData.country}
          onChange={handleChange}
          list="country-list"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Type or select country"
          autoComplete="off"
        />
        <datalist id="country-list">
          {countries.map((country) => (
            <option key={country} value={country} />
          ))}
        </datalist>
        {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.postalCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Postal code"
        />
        {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CPR/National ID
        </label>
        <input
          type="text"
          name="cprNationalId"
          value={formData.cprNationalId}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
          placeholder="CPR or National ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Passport ID
        </label>
        <input
          type="text"
          name="passportId"
          value={formData.passportId}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
          placeholder="Passport number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Passport Validity
        </label>
        <input
          type="date"
          name="passportValidity"
          value={formData.passportValidity}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

const EducationWorkStep = ({ formData, errors, handleChange, handleSuggestionClick, showSuggestion }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Level <span className="text-red-500">*</span>
        </label>
        <select
          name="educationLevel"
          value={formData.educationLevel}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.educationLevel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Education Level</option>
          <option value="Secondary Level">Secondary Level</option>
          <option value="College Graduate">College Graduate</option>
          <option value="Post Graduate">Post Graduate</option>
          <option value="Vocational">Vocational</option>
          <option value="Technical">Technical</option>
          <option value="Associate Diploma">Associate Diploma</option>
          <option value="Others">Others</option>
        </select>
        {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course/Degree <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="courseDegree"
          value={formData.courseDegree}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.courseDegree ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Computer Science"
        />
        {errors.courseDegree && <p className="text-red-500 text-sm mt-1">{errors.courseDegree}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currently Employed <span className="text-red-500">*</span>
        </label>
        <select
          name="currentlyEmployed"
          value={formData.currentlyEmployed}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.currentlyEmployed ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Status</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {errors.currentlyEmployed && <p className="text-red-500 text-sm mt-1">{errors.currentlyEmployed}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position Applied For <span className="text-red-500">*</span>
        </label>
        <select
          name="employmentDesired"
          value={formData.employmentDesired}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.employmentDesired ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select position</option>
          <option value="Logistic Officer">Logistic Officer</option>
          <option value="Office Admin">Office Admin</option>
          <option value="Accountant">Accountant</option>
          <option value="Business Development Manager">Business Development Manager</option>
          <option value="Freight Forwarder Agent">Freight Forwarder Agent</option>
          <option value="Others">Others</option>
        </select>
        {errors.employmentDesired && <p className="text-red-500 text-sm mt-1">{errors.employmentDesired}</p>}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Years of Experience <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <input
            type="text"
            name="yearsOfExperience"
            value={formData.yearsOfExperience}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
              errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Fresher or number (e.g. 1, 2, 5)"
          />
        </div>
        {showSuggestion && (
          <div className="absolute z-10 mt-1 w-full rounded-md shadow-lg bg-white">
            <div className="py-1">
              <div
                className="px-4 py-2 text-sm cursor-pointer text-gray-800 hover:bg-gray-100"
                onClick={() => handleSuggestionClick('Fresher')}
              >
                Fresher (0 years)
              </div>
            </div>
          </div>
        )}
        {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          When are you available to start? <span className="text-red-500">*</span>
        </label>
        <select
          name="availableStart"
          value={formData.availableStart}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.availableStart ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select option</option>
          <option value="Immediately">Immediately</option>
          <option value="After one week">After one week</option>
          <option value="After one month notice">After one month notice</option>
          <option value="Others">Others</option>
        </select>
        {errors.availableStart && <p className="text-red-500 text-sm mt-1">{errors.availableStart}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shift available to work? <span className="text-red-500">*</span>
        </label>
        <select
          name="shiftAvailable"
          value={formData.shiftAvailable}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.shiftAvailable ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select shift</option>
          <option value="DAYS">Days</option>
          <option value="EVENING">Evening</option>
          <option value="GRAVEYARD">Graveyard</option>
          <option value="WEEKENDS">Weekends</option>
        </select>
        {errors.shiftAvailable && <p className="text-red-500 text-sm mt-1">{errors.shiftAvailable}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Can Travel <span className="text-red-500">*</span>
        </label>
        <select
          name="canTravel"
          value={formData.canTravel}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.canTravel ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {errors.canTravel && <p className="text-red-500 text-sm mt-1">{errors.canTravel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Driving License <span className="text-red-500">*</span>
        </label>
        <select
          name="drivingLicense"
          value={formData.drivingLicense}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.drivingLicense ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
        {errors.drivingLicense && <p className="text-red-500 text-sm mt-1">{errors.drivingLicense}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills <span className="text-red-500">*</span>
        </label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          rows="4"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.skills ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="List your key skills..."
        />
        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
      </div>
    </div>
  </div>
);

const ReferencesStep = ({ formData, errors, handleChange, handlePhoneChange, defaultCountry }) => (
  <div className="space-y-8">
    {[1, 2, 3].map((refNum) => (
      <div key={refNum} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reference {refNum}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name={`ref${refNum}Name`}
              value={formData[`ref${refNum}Name`]}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
                errors[`ref${refNum}Name`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Reference name"
            />
            {errors[`ref${refNum}Name`] && <p className="text-red-500 text-sm mt-1">{errors[`ref${refNum}Name`]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact
            </label>
            <PhoneInput
              country={defaultCountry}
              value={formData[`ref${refNum}Contact`]}
              onChange={(phone) => handlePhoneChange(`ref${refNum}Contact`, phone)}
              inputClass={`w-full ${errors[`ref${refNum}Contact`] ? 'border-red-500' : ''}`}
              containerClass="w-full"
              inputStyle={{ width: '100%', height: '48px', fontSize: '16px' }}
            />
            {errors[`ref${refNum}Contact`] && <p className="text-red-500 text-sm mt-1">{errors[`ref${refNum}Contact`]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name={`ref${refNum}Email`}
              value={formData[`ref${refNum}Email`]}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
                errors[`ref${refNum}Email`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="reference@example.com"
            />
            {errors[`ref${refNum}Email`] && <p className="text-red-500 text-sm mt-1">{errors[`ref${refNum}Email`]}</p>}
          </div>
        </div>
      </div>
    ))}
    <p className="text-sm text-gray-600 italic">
      Note: If you fill any field for a reference, all fields for that reference become required.
    </p>
  </div>
);

const AdditionalInfoStep = ({ formData, errors, handleChange, file, fileError, handleFileChange }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visa Status
        </label>
        <select
          name="visaStatus"
          value={formData.visaStatus}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
        >
          <option value="">Select Visa Status</option>
          <option value="Valid">Valid</option>
          <option value="Expired">Expired</option>
          <option value="Not Applicable">Not Applicable</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visa Validity
        </label>
        <input
          type="date"
          name="visaValidity"
          value={formData.visaValidity}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expected Salary <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="expectedSalary"
          value={formData.expectedSalary}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.expectedSalary ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., 500"
          min="0"
        />
        {errors.expectedSalary && <p className="text-red-500 text-sm mt-1">{errors.expectedSalary}</p>}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          How would you get client leads? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="clientLeadsStrategy"
          value={formData.clientLeadsStrategy}
          onChange={handleChange}
          rows="4"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0284C7] focus:border-transparent ${
            errors.clientLeadsStrategy ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your strategy for getting client leads..."
        />
        {errors.clientLeadsStrategy && <p className="text-red-500 text-sm mt-1">{errors.clientLeadsStrategy}</p>}
      </div>
    </div>

    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Resume (PDF/DOCX/Image, Max 2MB) <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,image/*"
          className="hidden"
          id="resume-upload"
        />
        <label
          htmlFor="resume-upload"
          className={`flex items-center justify-center gap-2 w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition ${
            errors.file ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <FaFileUpload className="text-2xl text-[#0284C7]" />
          <span className="text-gray-600">
            {file ? file.name : 'Click to upload your resume'}
          </span>
        </label>
        {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
      </div>
    </div>
  </div>
);

const EmploymentForm = () => {
  const { pathname } = useLocation();
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [defaultCountry, setDefaultCountry] = useState('bh');
  const [showSuggestion, setShowSuggestion] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    mobileContact: '',
    whatsapp: '',
    currentAddress: '',
    postalCode: '',
    city: '',
    country: '',
    cprNationalId: '',
    passportId: '',
    passportValidity: '',
    educationLevel: '',
    courseDegree: '',
    currentlyEmployed: '',
    employmentDesired: '',
    yearsOfExperience: '',
    availableStart: '',
    shiftAvailable: '',
    canTravel: '',
    drivingLicense: '',
    skills: '',
    ref1Name: '',
    ref1Contact: '',
    ref1Email: '',
    ref2Name: '',
    ref2Contact: '',
    ref2Email: '',
    ref3Name: '',
    ref3Contact: '',
    ref3Email: '',
    visaStatus: '',
    visaValidity: '',
    expectedSalary: '',
    clientLeadsStrategy: '',
  });

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedStep, setSubmittedStep] = useState(null);
  const [progressWidth, setProgressWidth] = useState('25%');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { id: 1, name: 'Personal Info', icon: <FaUser />, color: '#0284C7' },
    { id: 2, name: 'Education/Work', icon: <FaBriefcase />, color: '#0369A1' },
    { id: 3, name: 'References', icon: <FaGraduationCap />, color: '#075985' },
    { id: 4, name: 'Complete', icon: <FaCheck />, color: '#0C4A6E' },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCountries();
    fetchUserCountry();
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    const width = `${((step - 1) / (steps.length - 1)) * 100}%`;
    setProgressWidth(width);
  }, [step]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        resetForm();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Fetch countries list
  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
      const data = await response.json();
      const countryNames = data.map(country => country.name.common).sort();
      setCountries(countryNames);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries(['Bahrain', 'India', 'United States', 'United Kingdom']); // Fallback
    }
  };

  // Fetch user's country based on IP
  const fetchUserCountry = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.country_code) {
        setDefaultCountry(data.country_code.toLowerCase());
      } else {
        setDefaultCountry('bh');
      }
    } catch (error) {
      console.error("Error fetching user's country:", error);
      setDefaultCountry('bh');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      mobileContact: '',
      whatsapp: '',
      currentAddress: '',
      postalCode: '',
      city: '',
      country: '',
      cprNationalId: '',
      passportId: '',
      passportValidity: '',
      educationLevel: '',
      courseDegree: '',
      currentlyEmployed: '',
      employmentDesired: '',
      yearsOfExperience: '',
      availableStart: '',
      shiftAvailable: '',
      canTravel: '',
      drivingLicense: '',
      skills: '',
      ref1Name: '',
      ref1Contact: '',
      ref1Email: '',
      ref2Name: '',
      ref2Contact: '',
      ref2Email: '',
      ref3Name: '',
      ref3Contact: '',
      ref3Email: '',
      visaStatus: '',
      visaValidity: '',
      expectedSalary: '',
      clientLeadsStrategy: '',
    });
    setFile(null);
    setFileError('');
    setErrors({});
    setStep(1);
    setSubmittedStep(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));

    // Show suggestion for "Fresher"
    if (name === 'yearsOfExperience') {
      const shouldShow = typeof value === 'string' && 
                        value.toLowerCase().startsWith('f') && 
                        !value.toLowerCase().startsWith('fresher');
      setShowSuggestion(shouldShow);
    }
  };

  const handlePhoneChange = (fieldName, phone) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: phone,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: '',
    }));
  };

  const handleSuggestionClick = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      yearsOfExperience: value,
    }));
    setShowSuggestion(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        setFileError('File size must be less than 2 MB');
        setFile(null);
        toast.error("📁 File too big! Max 2MB allowed.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: { backgroundColor: '#FEE2E2', color: '#0284C7' }
        });
      } else {
        setFile(selectedFile);
        setFileError('');
        toast.success("📄 File selected successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: { backgroundColor: '#D1FAE5', color: '#065F46' }
        });
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.postalCode) newErrors.postalCode = 'Postal Code is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.mobileContact) newErrors.mobileContact = 'Mobile number is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp number is required';
      if (!formData.currentAddress) newErrors.currentAddress = 'Current address is required';
    }

    if (step === 2) {
      if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
      if (!formData.employmentDesired) newErrors.employmentDesired = 'Position applied for is required';
      if (!formData.courseDegree) newErrors.courseDegree = 'Course/Degree is required';
      if (!formData.currentlyEmployed) newErrors.currentlyEmployed = 'Employment status is required';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
      if (!formData.availableStart) newErrors.availableStart = 'Available start date is required';
      if (!formData.shiftAvailable) newErrors.shiftAvailable = 'Shift availability is required';
      if (!formData.canTravel) newErrors.canTravel = 'Travel ability is required';
      if (!formData.drivingLicense) newErrors.drivingLicense = 'Driving license status is required';
      if (!formData.skills) newErrors.skills = 'Skills field is required';
    }

    if (step === 3) {
      for (let i = 1; i <= 3; i++) {
        const name = formData[`ref${i}Name`];
        const contact = formData[`ref${i}Contact`];
        const email = formData[`ref${i}Email`];
        const anyFieldFilled = name || contact || email;

        if (anyFieldFilled) {
          if (!name) newErrors[`ref${i}Name`] = 'Reference name is required';
          if (!contact) {
            newErrors[`ref${i}Contact`] = 'Reference contact is required';
          }
          if (!email) {
            newErrors[`ref${i}Email`] = 'Reference email is required';
          } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors[`ref${i}Email`] = 'Invalid email format';
          }
        }
      }
    }

    if (step === 4) {
      if (!formData.clientLeadsStrategy) newErrors.clientLeadsStrategy = 'Client leads strategy is required';
      if (!formData.expectedSalary) {
        newErrors.expectedSalary = 'Expected salary is required';
      } else if (!/^\d+$/.test(formData.expectedSalary)) {
        newErrors.expectedSalary = 'Expected salary must be a number';
      }
      if (!file) newErrors.file = 'File upload is required';
      if (fileError) newErrors.file = fileError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (e) => {
    e?.preventDefault();
    const valid = validateStep(step);
    if (valid) {
      setSubmittedStep(false);
      setStep(prev => Math.min(prev + 1, steps.length));
    } else {
      setSubmittedStep(step);
      toast.error("🚨 Please complete all required fields!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: '#FEE2E2', color: '#0284C7' }
      });
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId) => {
    if (stepId < step) {
      setStep(stepId);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (step !== 4 || isLoading) {
      return;
    }

    const valid = validateStep(step);
    setSubmittedStep(step);

    if (!valid) {
      toast.error("Please complete all required fields!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: '#FEE2E2', color: '#0284C7' }
      });
      return;
    }

    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }
      if (file) formDataToSend.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/employment/submit`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        console.error('Submission failed with status:', response.status);
        throw new Error('Failed to submit');
      }

      setIsSubmitted(true);
      setShowSuccess(true);
      toast.success("🎉 Application submitted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: '#D1FAE5', color: '#065F46' }
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("⚠️ Submission failed! Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        style: { backgroundColor: '#FEE2E2', color: '#0284C7' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handlePhoneChange={handlePhoneChange}
            countries={countries}
            defaultCountry={defaultCountry}
          />
        );
      case 2:
        return (
          <EducationWorkStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSuggestionClick={handleSuggestionClick}
            showSuggestion={showSuggestion}
          />
        );
      case 3:
        return (
          <ReferencesStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handlePhoneChange={handlePhoneChange}
            defaultCountry={defaultCountry}
          />
        );
      case 4:
        return (
          <AdditionalInfoStep
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            file={file}
            fileError={fileError}
            handleFileChange={handleFileChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 mt- font-noto-serif bg-gradient-to-br from-[#F9FAFB] to-[#e2e3e6] rounded-3xl shadow-2xl my-16 border border-opacity-10 border-gray-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        progressStyle={{
          background: 'linear-gradient(to right, #0284C7, #0369A1)'
        }}
      />

      <div className="relative z-10 mt-8 text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 bg-[#0284C7] bg-clip-text text-transparent">Join Our Team</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Complete the form below to start your journey with us. We're excited to learn more about you!
        </p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <motion.svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your application has been submitted successfully. We'll get back to you soon.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-gray-500"
              >
                This message will close automatically...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuccess && (
        <>
          <div className="relative mb-12 px-4">
            <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-6 relative z-10">
              {steps.map((stepItem, index) => (
                <div
                  key={stepItem.id}
                  className="flex flex-col items-center cursor-pointer w-full lg:w-auto"
                  onClick={() => handleStepClick(stepItem.id)}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
                      step >= stepItem.id
                        ? 'bg-gradient-to-br from-[${stepItem.color}] to-[${stepItem.color}]'
                        : 'bg-gray-200'
                    }`}
                    style={{
                      background:
                        step >= stepItem.id
                          ? `linear-gradient(135deg, ${stepItem.color}, ${stepItem.color})`
                          : '#E5E7EB',
                    }}
                    whileHover={{ scale: stepItem.id <= step ? 1.1 : 1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step > stepItem.id ? (
                      <FaCheck className="text-xl" />
                    ) : (
                      React.cloneElement(stepItem.icon, { className: 'text-xl' })
                    )}
                  </motion.div>
                  <motion.span
                    className={`text-md mt-3 font-semibold tracking-wide text-center ${
                      step >= stepItem.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    {stepItem.name}
                  </motion.span>
                </div>
              ))}
            </div>

            <div className="hidden lg:block absolute top-8 left-8 right-5 ml-4 h-3 bg-gray-100 rounded-full -z-0 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0C4A6E] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step === 4) handleSubmit();
            }}
            className="relative z-10 px-0 lg:px-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {step > 1 ? (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 cursor-pointer bg-white text-[#0284C7] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium flex items-center gap-2 border border-[#0284C7] hover:bg-[#f0f4ff]"
                  whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaArrowLeft className="text-sm" />
                  Previous
                </motion.button>
              ) : (
                <div></div>
              )}

              {step === 4 ? (
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 cursor-pointer bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium flex items-center justify-center gap-2 min-w-[180px]"
                  whileHover={!isLoading ? { scale: 1.03, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    </div>
                  ) : (
                    <>
                      Submit Application
                      <FaFileUpload className="text-sm" />
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={(e) => nextStep(e)}
                  className="px-6 py-3 cursor-pointer bg-[#0284C7] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 font-medium flex items-center gap-2"
                  whileHover={{ scale: 1.03, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                  <FaArrowRight className="text-sm" />
                </motion.button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Step {step} of {steps.length} • {Math.round((step / steps.length) * 100)}% complete
          </div>
        </>
      )}
    </div>
  );
};

export default EmploymentForm;
