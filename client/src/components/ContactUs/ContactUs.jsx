import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import countryList from 'react-select-country-list';
import './ContactUs.css';
import LocationSection from '../Map/Map';

// This function remains the same.
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

// NEW: A utility function to check the validity of a field.
const validateField = (name, value) => {
    switch (name) {
        case 'company':
        case 'name':
        case 'commodity':
            return value.trim().length >= 2;
        case 'email':
            // Simple email regex
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'telephone':
            // react-phone-input-2 gives a value with country code. Check for a reasonable length.
            return value.length > 8;
        case 'grossWeight':
        case 'length':
        case 'width':
        case 'height':
        case 'boxesPallets':
            return !isNaN(value) && Number(value) > 0;
        case 'boxPalletSize':
            return value.trim().length > 0;
        // For dropdowns, check if it's not the initial empty value.
        case 'portOfLoading':
        case 'portOfLoadingCity':
        case 'portOfDischarge':
        case 'portOfDischargeCity':
        case 'modeOfShipment':
            return value !== '';
        default:
            return true; // Assume valid if no specific rule
    }
};

const ContactUs = () => {
    // Initial state for the form data
    const initialFormData = {
        company: '', name: '', telephone: '', email: '', message: '',
        portOfLoading: '', portOfLoadingCity: '', portOfDischarge: '', portOfDischargeCity: '',
        commodity: '', grossWeight: '', weightUnit: 'kg', dimensionUnit: 'cm',
        boxesPallets: '', boxPalletSize: '', boxPalletUnit: 'cm', modeOfShipment: '',
        length: '', width: '', height: '',
    };
    
    const [formData, setFormData] = useState(initialFormData);

    // NEW: State to track the validity of each field.
    const [fieldValidity, setFieldValidity] = useState({});

    const [initialCountry, setInitialCountry] = useState('bh');
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const [uniqueId, setUniqueId] = useState('');
    const [loadingCities, setLoadingCities] = useState([]);
    const [dischargeCities, setDischargeCities] = useState([]);

    const countryOptions = useMemo(() => countryList().getData(), []);

    useEffect(() => {
        const fetchUserCountry = async () => {
            try {
                const response = await fetch('https://ipinfo.io/json?token=6b3f765fe8dfe5');
                const data = await response.json();
                if (data.country) {
                    setInitialCountry(data.country.toLowerCase());
                }
            } catch (error) {
                console.error('Error fetching geolocation:', error);
                setInitialCountry('bh');
            }
        };
        fetchUserCountry();
    }, []);

    const handleCountryChange = async (e, portType) => {
        const { name, value } = e.target;
        const isLoadingPort = portType === 'portOfLoading';
        const citySetter = isLoadingPort ? setLoadingCities : setDischargeCities;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            [isLoadingPort ? 'portOfLoadingCity' : 'portOfDischargeCity']: ''
        }));
        
        // NEW: Validate this field and reset the city validity
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

    // NEW: Generic handler for when a user clicks away from an input.
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setFieldValidity(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));

        // For dropdowns, we can validate on change as it's a single action.
        if (e.target.tagName === 'SELECT') {
            handleBlur(e);
        }
    };

    const handlePhoneChange = (phone) => {
        setFormData((prevData) => ({ ...prevData, telephone: phone }));
        // Validate the phone number on change for immediate feedback.
        setFieldValidity(prev => ({ ...prev, telephone: validateField('telephone', phone) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recaptchaValue) { alert("Please verify you're not a robot."); return; }
        // NEW: Final validation check on all fields before submitting.
        let isFormValid = true;
        const newValidity = {};
        for (const key in initialFormData) {
            const isValid = validateField(key, formData[key]);
            newValidity[key] = isValid;
            if (!isValid && key !== 'message' && key !== 'dimensions') { // message can be optional if not required
                isFormValid = false;
            }
        }
        setFieldValidity(newValidity);
        if (!isFormValid) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        const shortId = uuidv4().split('-')[0];
        setUniqueId(shortId);
        setSuccessMessage(true);

        const emailData = { to: "customercare@gvscargo.com", from: "customercare@gvscargo.com", subject: `Form Submission from ${formData.email}`, message: `...` /* Your message body */ };

        try {
            await fetch('https://gvscargo.com/send_to_a_mail.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailData) });
            setTimeout(() => {
                setSuccessMessage(false);
                setFormData(initialFormData); // Reset form data
                setFieldValidity({}); // NEW: Reset validity state
                setRecaptchaValue(null);
                // The ReCAPTCHA component might need a manual reset if it doesn't clear on its own
            }, 3000);
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting form');
            setSuccessMessage(false);
        }
    };

    // NEW: A helper to render the validation icon. This makes the JSX much cleaner.
    const renderValidationIcon = (fieldName) => {
        if (fieldValidity[fieldName]) {
            return (
                <div className="absolute top-1/2 right-3 -translate-y-1/2 text-green-500 pointer-events-none transition-opacity duration-300">
                    <AiOutlineCheckCircle className="h-5 w-5" />
                </div>
            );
        }
        return null;
    };
    
    // An initial state for form data.
    return (
        <div>
            <div className="lg:max-w-2xl max-w-md shadow-custom font-roboto mx-auto mt-12">
                {successMessage ? (
                     <div className="success-message flex items-center bg-DarkBlue text-white p-4 rounded-lg shadow-lg">
                        <AiOutlineCheckCircle className="checkmark text-5xl mr-4 animate-pulse" />
                        <span className="text-lg font-semibold">
                            Form submitted successfully! We'll get in touch with you shortly. Your reference ID is: {uniqueId}
                        </span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded space-y-4">
                        <h2 className="text-2xl font-semibold text-left">Fill in the required fields*</h2>

                        {/* Wrap each input in a relative div to position the icon */}
                        <div className="relative w-full">
                            <input type="text" name="company" value={formData.company} onChange={handleChange} onBlur={handleBlur} placeholder="Company *" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                            {renderValidationIcon('company')}
                        </div>
                        <div className="relative w-full">
                            <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} placeholder="Name *" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                            {renderValidationIcon('name')}
                        </div>
                        <div className="relative w-full">
                            <PhoneInput country={initialCountry} value={formData.telephone} onChange={handlePhoneChange} placeholder="Phone Number *" inputStyle={{ width: '100%', height: '42px', paddingRight: '40px' }} inputProps={{ required: true, name: 'telephone' }} />
                            {renderValidationIcon('telephone')}
                        </div>
                        <div className="relative w-full">
                            <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder="Email *" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                            {renderValidationIcon('email')}
                        </div>

                        {/* Port of Loading */}
                        <div className="space-y-4">
                            <div className="relative">
                                <select name="portOfLoading" value={formData.portOfLoading} onChange={(e) => handleCountryChange(e, "portOfLoading")} className="w-full p-2 border font-roboto border-gray-300 rounded focus:outline-none pr-10" required>
                                    <option value="" disabled>Select Country For Port of Loading *</option>
                                    {countryOptions.map(({ value, label }) => (<option key={value} value={label}>{label}</option>))}
                                </select>
                                {renderValidationIcon('portOfLoading')}
                            </div>
                            <div className="relative">
                                <select name="portOfLoadingCity" value={formData.portOfLoadingCity} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required>
                                    <option value="" disabled>Select City for Port of Loading *</option>
                                    {loadingCities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                                </select>
                                {renderValidationIcon('portOfLoadingCity')}
                            </div>
                        </div>

                        {/* Port of Discharge */}
                        <div className="space-y-4">
                            <div className="relative">
                                <select name="portOfDischarge" value={formData.portOfDischarge} onChange={(e) => handleCountryChange(e, 'portOfDischarge')} className="w-full p-2 border font-roboto border-gray-300 rounded focus:outline-none pr-10" required>
                                    <option value="" disabled>Select Country For Port of Discharge *</option>
                                    {countryOptions.map(({ value, label }) => (<option key={value} value={label}>{label}</option>))}
                                </select>
                                {renderValidationIcon('portOfDischarge')}
                            </div>
                            <div className="relative">
                                <select name="portOfDischargeCity" value={formData.portOfDischargeCity} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required>
                                    <option value="" disabled>Select City for Port of Discharge *</option>
                                    {dischargeCities.map((city, index) => <option key={index} value={city}>{city}</option>)}
                                </select>
                                {renderValidationIcon('portOfDischargeCity')}
                            </div>
                        </div>

                        <div className="relative w-full">
                            <input type="text" name="commodity" value={formData.commodity} onChange={handleChange} onBlur={handleBlur} placeholder="Commodity" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                            {renderValidationIcon('commodity')}
                        </div>

                        <div className="flex space-x-4">
                            <div className="relative w-2/3">
                                <input type="number" name="grossWeight" value={formData.grossWeight} onChange={handleChange} onBlur={handleBlur} placeholder="Gross Weight" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                                {renderValidationIcon('grossWeight')}
                            </div>
                            <select name="weightUnit" value={formData.weightUnit} onChange={handleChange} className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none" required>
                                <option value="kg">kg</option><option value="tonnes">Tonnes</option><option value="lbs">lbs</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-700">Dimensions</h3>
                            <div className="flex items-center space-x-2">
                                <div className="relative w-1/4"><input type="number" name="length" value={formData.length} onChange={handleChange} onBlur={handleBlur} placeholder="L" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-8" required />{renderValidationIcon('length')}</div>
                                <div className="relative w-1/4"><input type="number" name="width" value={formData.width} onChange={handleChange} onBlur={handleBlur} placeholder="W" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-8" required />{renderValidationIcon('width')}</div>
                                <div className="relative w-1/4"><input type="number" name="height" value={formData.height} onChange={handleChange} onBlur={handleBlur} placeholder="H" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-8" required />{renderValidationIcon('height')}</div>
                                <select name="dimensionUnit" value={formData.dimensionUnit} onChange={handleChange} className="w-1/4 p-2 border border-gray-300 rounded focus:outline-none" required><option value="cm">cm</option><option value="inch">inch</option></select>
                            </div>
                        </div>
                        
                        <div className="relative w-full">
                             <input type="number" name="boxesPallets" value={formData.boxesPallets} onChange={handleChange} onBlur={handleBlur} placeholder="Number of Boxes/Pallets" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                             {renderValidationIcon('boxesPallets')}
                        </div>
                       
                        <div className="flex space-x-4">
                            <div className="relative w-2/3">
                                <input type="text" name="boxPalletSize" value={formData.boxPalletSize} onChange={handleChange} onBlur={handleBlur} placeholder="Size of Each Box/Pallet" className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10" required />
                                {renderValidationIcon('boxPalletSize')}
                            </div>
                            <select name="boxPalletUnit" value={formData.boxPalletUnit} onChange={handleChange} className="w-1/3 p-2 border border-gray-300 rounded focus:outline-none" required><option value="cm">cm</option><option value="inch">inch</option></select>
                        </div>
                        
                        <div className="relative w-full">
                            <select name="modeOfShipment" value={formData.modeOfShipment} onChange={handleChange} onBlur={handleBlur} className="w-full p-2 border border-gray-300 rounded focus:outline-none text-gray-700 pr-10" required>
                                <option value="" disabled>Mode of Shipment *</option><option value="Commercial">Commercial</option><option value="Personal">Personal</option>
                            </select>
                            {renderValidationIcon('modeOfShipment')}
                        </div>

                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Message *" className="w-full p-2 border border-gray-300 rounded focus:outline-none" rows="4" required />
                        <ReCAPTCHA sitekey="6LeqpnkqAAAAAHNUm3Ey9nv2T0hmhl0Ym4L_yaTS" onChange={(value) => setRecaptchaValue(value)} />
                        <button type="submit" className="w-full py-2 text-white bg-yellow-500 rounded font-semibold hover:bg-yellow-600">Send</button>
                    </form>
                )}
            </div>
            <LocationSection />
        </div>
    );
};

export default ContactUs;