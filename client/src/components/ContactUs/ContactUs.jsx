import { useState, useEffect, useMemo,useRef  } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlineCheckCircle, AiOutlineArrowRight, AiOutlineArrowLeft } from 'react-icons/ai';
import { FaCheck } from 'react-icons/fa';
import countryList from 'react-select-country-list';
import { motion, AnimatePresence } from 'framer-motion';
import './ContactUs.css';
import LocationSection from '../Map/Map';
import { useRegion } from '../../context/RegionContext';

// --- HELPER FUNCTIONS (No changes needed here) ---
const cache = new Map();
const fetchCitiesByCountry = async (country) => {
    if (cache.has(country)) return cache.get(country);
    const bahrainCities = ["Khalifa Bin Salman Port (KBSP) (Hidd)", "Mina Salman Port (Manama)", "Sitra Industrial Port (Sitra)", "Bahrain International Airport"];
    const uaePorts = ["Jebel Ali Port (Dubai)", "Port Rashid (Dubai)", "Mina Zayed Port (Abu Dhabi)", "Khalifa Port (Abu Dhabi)", "Sharjah Port (Khalid Port) (Sharjah)", "Hamriyah Port (Sharjah)", "Fujairah Port (Fujairah)", "Port of Khor Fakkan (Sharjah)", "Ruwais Port (Abu Dhabi)", "Umm Al Quwain Port (Umm Al Quwain)", "Ajman Port (Ajman)", "Dubai International Airport (DXB)", "Al Maktoum International Airport (DWC)", "Abu Dhabi International Airport (AUH)", "Sharjah International Airport (SHJ)", "Ras Al Khaimah International Airport (RKT)"];
    if (country === "Bahrain") { cache.set(country, bahrainCities); return bahrainCities; }
    if (country === "United Arab Emirates") { cache.set(country, uaePorts); return uaePorts; }
    try {
        const response = await fetch(`https://countriesnow.space/api/v0.1/countries/cities`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ country }) });
        const data = await response.json();
        const cities = data.data || [];
        cache.set(country, cities);
        return cities;
    } catch (error) { console.error("Error fetching cities:", error); return []; }
};

const validateField = (name, value) => {
    switch (name) {
        case 'company':
        case 'name':
        case 'commodity':
            return value.trim().length >= 2;
        case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'telephone':
            return value.length > 8;
        case 'grossWeight':
        case 'length':
        case 'width':
        case 'height':
        case 'boxesPallets':
            return !isNaN(value) && Number(value) > 0;
        case 'boxPalletSize':
            return value.trim().length > 0;
        case 'portOfLoading':
        case 'portOfLoadingCity':
        case 'portOfDischarge':
        case 'portOfDischargeCity':
        case 'modeOfShipment':
        case 'message': // message is required in this design
             return value.trim() !== '';
        default:
            return true;
    }
};


// --- STEPPER/PROGRESS BAR COMPONENT ---
const Stepper = ({ currentStep }) => {
    const steps = ['Contact Info', 'Shipment Route', 'Cargo Details'];

    return (
        <div className="mb-8 w-full ml-16">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;

                    return (
                        <div key={step} className="flex items-center w-full">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                                        ${isCompleted ? 'bg-green-500 text-white' : ''}
                                        ${isActive ? 'bg-yellow-500 text-white scale-110' : ''}
                                        ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-500' : ''}
                                    `}
                                >
                                    {isCompleted ? <FaCheck /> : stepNumber}
                                </div>
                                <p className={`mt-2 text-center text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {step}
                                </p>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



// --- MAIN CONTACT US COMPONENT ---
// --- MAIN CONTACT US COMPONENT ---
const ContactUs = () => {
    const { content, isLoading } = useRegion();

    // --- STATE MANAGEMENT ---
    const initialFormData = {
        company: '', name: '', telephone: '', email: '', message: '',
        portOfLoading: '', portOfLoadingCity: '', portOfDischarge: '', portOfDischargeCity: '',
        commodity: '', grossWeight: '', weightUnit: 'kg', dimensionUnit: 'cm',
        boxesPallets: '', boxPalletSize: '', boxPalletUnit: 'cm', modeOfShipment: '',
        length: '', width: '', height: '',
    };
    
    const [formData, setFormData] = useState(initialFormData);
    const [fieldValidity, setFieldValidity] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    
    const [initialCountry, setInitialCountry] = useState('bh');
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const [uniqueId, setUniqueId] = useState('');
    const [loadingCities, setLoadingCities] = useState([]);
    const [dischargeCities, setDischargeCities] = useState([]);

    const countryOptions = useMemo(() => countryList().getData(), []);
    useEffect(() => {

        if (successMessage) {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }
      }, [successMessage])
    useEffect(() => {
        const fetchUserCountry = async () => {
            try {
                const response = await fetch('https://ipinfo.io/json?token=6b3f765fe8dfe5');
                const data = await response.json();
                if (data.country) { setInitialCountry(data.country.toLowerCase()); }
            } catch (error) { console.error('Error fetching geolocation:', error); setInitialCountry('bh'); }
        };
        fetchUserCountry();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
        if (e.target.tagName === 'SELECT') {
            handleBlur(e);
        }
    };

    const handlePhoneChange = (phone) => {
        setFormData((prevData) => ({ ...prevData, telephone: phone }));
        setFieldValidity(prev => ({ ...prev, telephone: validateField('telephone', phone) }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setFieldValidity(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleCountryChange = async (e, portType) => {
        const { name, value } = e.target;
        const isLoadingPort = portType === 'portOfLoading';
        const citySetter = isLoadingPort ? setLoadingCities : setDischargeCities;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            [isLoadingPort ? 'portOfLoadingCity' : 'portOfDischargeCity']: ''
        }));
        
        setFieldValidity(prev => ({ 
            ...prev, 
            [name]: validateField(name, value),
            [isLoadingPort ? 'portOfLoadingCity' : 'portOfDischargeCity']: false
        }));

        if (value) {
            citySetter([]);
            const cities = await fetchCitiesByCountry(value);
            citySetter(cities);
        }
    };

    const validateCurrentStep = () => {
        let fieldsToValidate = [];
        if (currentStep === 1) {
            fieldsToValidate = ['company', 'name', 'telephone', 'email'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['portOfLoading', 'portOfLoadingCity', 'portOfDischarge', 'portOfDischargeCity', 'modeOfShipment'];
        } else if (currentStep === 3) {
            fieldsToValidate = ['commodity', 'grossWeight', 'length', 'width', 'height', 'boxesPallets', 'boxPalletSize', 'message'];
        }
        
        let isStepValid = true;
        const newValidity = { ...fieldValidity };
        for (const field of fieldsToValidate) {
            const isValid = validateField(field, formData[field]);
            newValidity[field] = isValid;
            if (!isValid) {
                isStepValid = false;
            }
        }
        setFieldValidity(newValidity);
        return isStepValid;
    };
    
    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => prev + 1);
        } else {
            alert('Please fill out all required fields on this page correctly.');
        }
    };
    
    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateCurrentStep()) {
             alert('Please fill out all required fields correctly.');
             return;
        }
        if (!recaptchaValue) { 
            alert("Please verify you're not a robot.");
            return; 
        }

        const shortId = uuidv4().split('-')[0];
        setUniqueId(shortId);
        
        const messageBody = `
        New Contact Form Submission\n
        ---------------------------\n
        Reference ID: ${shortId}\n\n
        Company: ${formData.company}\n
        Name: ${formData.name}\n
        Telephone: ${formData.telephone}\n
        Email: ${formData.email}\n\n
        -- Shipment Details --\n
        Port of Loading: ${formData.portOfLoadingCity}, ${formData.portOfLoading}\n
        Port of Discharge: ${formData.portOfDischargeCity}, ${formData.portOfDischarge}\n
        Mode of Shipment: ${formData.modeOfShipment}\n\n
        -- Cargo Details --\n
        Commodity: ${formData.commodity}\n
        Gross Weight: ${formData.grossWeight} ${formData.weightUnit}\n
        Number of Boxes/Pallets: ${formData.boxesPallets}\n
        Size of Each Box/Pallet: ${formData.boxPalletSize} ${formData.dimensionUnit}\n
        Dimensions (LxWxH): ${formData.length} x ${formData.width} x ${formData.height}\n\n
        -- Message --\n
        ${formData.message}
    `;
        const emailData = { 
            to: content.email_customer_care, 
            from: content.email_customer_care, 
            subject: `New Quote Request from ${formData.company} - Ref: ${shortId}`, 
            message: messageBody 
        };

        try {
            setSuccessMessage(true);
            await fetch('https://gvscargo.com/send_to_a_mail.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailData) });
            
            // --- NEW: Refresh the page after 3 seconds ---
            setTimeout(() => {
                window.location.reload();
            }, 1800);

        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form');
            setSuccessMessage(false); // Revert on error
        }
    };

    const renderValidationIcon = (fieldName) => {
        if (fieldValidity[fieldName]) {
            return (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-green-500 pointer-events-none transition-opacity duration-300">
                    <AiOutlineCheckCircle className="h-5 w-5" />
                </div>
            );
        }
        return null;
    };
    
    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <div className="bg-slate-50 py-12 font-roboto">
            <div className="lg:max-w-3xl max-w-lg bg-white shadow-2xl rounded-2xl mx-auto overflow-hidden">
                {successMessage ? (
                     <div className="success-message flex flex-col items-center justify-center bg-white text-gray-800 p-12 rounded-lg text-center h-[600px]">
                        <AiOutlineCheckCircle className="checkmark text-8xl text-green-500 mb-6 animate-pulse" />
                        <h2 className="text-3xl font-bold mb-2">Thank You!</h2>
                        <p className="text-lg mb-4">
                            Your form has been submitted successfully. We'll be in touch shortly.
                        </p>
                        <p className="text-md text-gray-500">
                            Your reference ID is: <span className="font-semibold text-gray-700">{uniqueId}</span>
                        </p>
                    </div>
                ) : (
                    <div className="p-8 md:p-12">
                        <Stepper currentStep={currentStep} />
                        
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    variants={stepVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* --- STEP 1: Contact Info --- */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="input-label">Company *</label>
                                                <div className="relative"><input type="text" name="company" value={formData.company} onChange={handleChange} onBlur={handleBlur} placeholder="Your Company Name" className="form-input pr-10" required />{renderValidationIcon('company')}</div>
                                            </div>
                                            <div>
                                                <label className="input-label">Name *</label>
                                                <div className="relative"><input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} placeholder="Your Full Name" className="form-input pr-10" required />{renderValidationIcon('name')}</div>
                                            </div>
                                            <div>
                                                <label className="input-label">Phone Number *</label>
                                                <div className="relative"><PhoneInput country={initialCountry} value={formData.telephone} onChange={handlePhoneChange} inputClass="form-input" inputProps={{ required: true, name: 'telephone' }} />{renderValidationIcon('telephone')}</div>
                                            </div>
                                            <div>
                                                <label className="input-label">Email *</label>
                                                <div className="relative"><input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="you@company.com" className="form-input pr-10" required />{renderValidationIcon('email')}</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- STEP 2: Shipment Route --- */}
                                   {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h3 className="font-semibold text-lg text-gray-700 mb-3">Port of Loading</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="input-label">Country *</label>
                                                        <div className="relative">
                                                            <select name="portOfLoading" value={formData.portOfLoading} onChange={(e) => handleCountryChange(e, "portOfLoading")} className="form-input" required>
                                                                <option value="" disabled>Select Country</option>
                                                                {countryOptions.map(({ value, label }) => (<option key={value} value={label}>{label}</option>))}
                                                            </select>
                                                            {renderValidationIcon('portOfLoading')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="input-label">City / Port *</label>
                                                        <div className="relative">
                                                            <select name="portOfLoadingCity" value={formData.portOfLoadingCity} onChange={handleChange} onBlur={handleBlur} className="form-input" required>
                                                                <option value="" disabled>Select City or Port</option>
                                                                {loadingCities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                                                            </select>
                                                            {renderValidationIcon('portOfLoadingCity')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <h3 className="font-semibold text-lg text-gray-700 mb-3">Port of Discharge</h3>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="input-label">Country *</label>
                                                        <div className="relative">
                                                            <select name="portOfDischarge" value={formData.portOfDischarge} onChange={(e) => handleCountryChange(e, 'portOfDischarge')} className="form-input" required>
                                                                <option value="" disabled>Select Country</option>
                                                                {countryOptions.map(({ value, label }) => (<option key={value} value={label}>{label}</option>))}
                                                            </select>
                                                            {renderValidationIcon('portOfDischarge')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="input-label">City / Port *</label>
                                                        <div className="relative">
                                                            <select name="portOfDischargeCity" value={formData.portOfDischargeCity} onChange={handleChange} onBlur={handleBlur} className="form-input" required>
                                                                <option value="" disabled>Select City or Port</option>
                                                                {dischargeCities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                                                            </select>
                                                            {renderValidationIcon('portOfDischargeCity')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="input-label">Mode of Shipment *</label>
                                                <div className="relative">
                                                    <select name="modeOfShipment" value={formData.modeOfShipment} onChange={handleChange} onBlur={handleBlur} className="form-input" required>
                                                        <option value="" disabled>Select Mode</option>
                                                        <option value="Commercial">Commercial</option>
                                                        <option value="Personal">Personal</option>
                                                    </select>
                                                    {renderValidationIcon('modeOfShipment')}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- STEP 3: Cargo Details --- */}
                                   {/* --- STEP 3: Cargo Details --- */}
{currentStep === 3 && (
    <div className="space-y-6">
        <div>
            <label className="input-label">Commodity *</label>
            <div className="relative"><input type="text" name="commodity" value={formData.commodity} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Electronics, Furniture" className="form-input pr-10" required />{renderValidationIcon('commodity')}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="input-label">Gross Weight *</label>
                <div className="flex space-x-2">
                    <div className="relative w-2/3"><input type="number" name="grossWeight" value={formData.grossWeight} onChange={handleChange} onBlur={handleBlur} placeholder="1000" className="form-input pr-10" required />{renderValidationIcon('grossWeight')}</div>
                    <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="form-input w-1/3" required>
                        <option value="kg">kg</option>
                        <option value="tonnes">Tonnes</option>
                        <option value="lbs">lbs</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="input-label">No. of Boxes/Pallets *</label>
                <div className="relative"><input type="number" name="boxesPallets" value={formData.boxesPallets} onChange={handleChange} onBlur={handleBlur} placeholder="10" className="form-input pr-10" required />{renderValidationIcon('boxesPallets')}</div>
            </div>
        </div>

        <div>
            <label className="input-label">Dimensions (L x W x H) *</label>
            <div className="flex items-center space-x-2">
                {/* Inputs are now wider to fill the space */}
                <div className="relative w-1/3"><input type="number" name="length" value={formData.length} onChange={handleChange} onBlur={handleBlur} placeholder="L" className="form-input pr-8" required />{renderValidationIcon('length')}</div>
                <div className="relative w-1/3"><input type="number" name="width" value={formData.width} onChange={handleChange} onBlur={handleBlur} placeholder="W" className="form-input pr-8" required />{renderValidationIcon('width')}</div>
                <div className="relative w-1/3"><input type="number" name="height" value={formData.height} onChange={handleChange} onBlur={handleBlur} placeholder="H" className="form-input pr-8" required />{renderValidationIcon('height')}</div>
            </div>
        </div>

        <div>
            <label className="input-label">Size of Each Box/Pallet *</label>
            {/* NEW: Input and dropdown are now grouped together */}
            <div className="flex space-x-2">
                <div className="relative w-2/3">
                    <input type="text" name="boxPalletSize" value={formData.boxPalletSize} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 120x80x100" className="form-input" required />
                    {renderValidationIcon('boxPalletSize')}
                </div>
                <select name="boxPalletUnit" value={formData.boxPalletUnit} onChange={handleChange} className="form-input w-1/3" required>
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                </select>
            </div>
        </div>

        <div>
            <label className="input-label">Message *</label>
            <textarea name="message" value={formData.message} onChange={handleChange} onBlur={handleBlur} placeholder="Any additional details or special requirements..." className="form-input" rows="4" required />
        </div>

        <div className="flex justify-center">
            <ReCAPTCHA sitekey="6LeqpnkqAAAAAHNUm3Ey9nv2T0hmhl0Ym4L_yaTS" onChange={(value) => setRecaptchaValue(value)} />
        </div>
    </div>
)}
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-10 flex justify-between items-center">
                                {currentStep > 1 ? ( <button type="button" onClick={handleBack} className="btn-secondary"> <AiOutlineArrowLeft className="mr-2" /> Back </button> ) : ( <div></div> /* Empty div to maintain spacing */ )}
                                {currentStep < 3 && ( <button type="button" onClick={handleNext} className="btn-primary"> Next <AiOutlineArrowRight className="ml-2" /> </button> )}
                                {currentStep === 3 && ( <button type="submit" disabled={isLoading || !recaptchaValue} className="btn-primary"> {isLoading ? 'Submitting...' : 'Submit Request'} </button> )}
                            </div>
                        </form>
                    </div>
                )}
            </div>
            <LocationSection />
        </div>
    );
};

export default ContactUs;