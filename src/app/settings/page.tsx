'use client'; // Tabs, forms, aur state ke liye zaroori hai

import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSettings,
  LuInfo,
  LuPalette,
  LuGlobe,
  LuSave,
  LuPhone,
  LuMapPin,
  LuClock,
  LuDollarSign,
  LuUpload,
  LuImage,
  LuFileText,
  LuLayoutGrid,
  LuPaintbrush,
  LuMail,
} from 'react-icons/lu';

// --- Types ---
type TabName = 'general' | 'branding' | 'localization';

// --- Dummy State (Global for all settings) ---
const initialSettings = {
  // General
  appTitle: 'Demo Hospital Limited',
  address: '98 Green Road, Farmgate, Dhaka-1215',
  email: 'bdtask@gmail.com',
  phone: '1922296392',
  footerText: '2025©Copyright bdtask',

  // Branding
  themeColor: '#4F46E5', // Indigo (Main Theme)
  sidebarColor: '#111827', // Gray 900 (Sidebar)
  pageBgColor: '#F9FAFB', // Gray 50 (Page Background)

  // Localization
  language: 'en',
  timeZone: 'Asia/Dhaka',
  currency: 'USD',
};

/**
 * ==========================================
 * Main Settings Page Component
 * ==========================================
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabName>('general');
  const [settings, setSettings] = useState(initialSettings);

  // Form ke data ko handle karein
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));

    // --- WORKING FEATURE: Live Colour Change ---
    // (Yeh sirf demo ke liye hai, save karne par hi permanent hona chahiye)
    if (name === 'sidebarColor') {
      document.documentElement.style.setProperty('--color-sidebar-bg', value);
    }
    if (name === 'pageBgColor') {
      document.documentElement.style.setProperty('--color-page-bg', value);
    }
  };

  // Form submit karein
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Settings Saved:', settings);
    alert('Settings saved successfully! (Check console for data)');
    // Asli app mein, aap yeh settings database mein save karenge
    // aur CSS variables ko update karenge.
  };

  return (
    <div className="space-y-8">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-3">
        <LuSettings className="h-8 w-8 text-indigo-700" />
        <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
      </div>

      {/* --- Main Settings Layout --- */}
      <div className="bg-white rounded-xl shadow-md">
        {/* --- Header Tab Menu --- */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6 -mb-px space-x-8" aria-label="Tabs">
            <TabButton
              label="General"
              icon={LuInfo}
              isActive={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
            />
            <TabButton
              label="Branding"
              icon={LuPalette}
              isActive={activeTab === 'branding'}
              onClick={() => setActiveTab('branding')}
            />
            <TabButton
              label="Localization"
              icon={LuGlobe}
              isActive={activeTab === 'localization'}
              onClick={() => setActiveTab('localization')}
            />
          </nav>
        </div>

        {/* --- Form Content --- */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8">
            {/* General Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <InputGroup
                    label="Application Title" name="appTitle" value={settings.appTitle}
                    onChange={handleChange} icon={LuInfo} required
                  />
                  <TextAreaGroup
                    label="Address" name="address" value={settings.address}
                    onChange={handleChange} icon={LuMapPin}
                  />
                  <InputGroup
                    label="Email Address" name="email" value={settings.email}
                    onChange={handleChange} icon={LuMail} required type="email"
                  />
                  <InputGroup
                    label="Phone No" name="phone" value={settings.phone}
                    onChange={handleChange} icon={LuPhone} required
                  />
                  <TextAreaGroup
                    label="Footer Text" name="footerText" value={settings.footerText}
                    onChange={handleChange} icon={LuFileText}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Branding Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'branding' && (
                <motion.div
                  key="branding"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <CustomFileInput label="Logo" name="logo" />
                  <CustomFileInput label="Favicon" name="favicon" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                    <InputGroup
                      label="Theme Color" name="themeColor" value={settings.themeColor}
                      onChange={handleChange} icon={LuPaintbrush} type="color"
                    />
                    <InputGroup
                      label="Sidebar Background" name="sidebarColor" value={settings.sidebarColor}
                      onChange={handleChange} icon={LuLayoutGrid} type="color"
                    />
                    <InputGroup
                      label="Page Background" name="pageBgColor" value={settings.pageBgColor}
                      onChange={handleChange} icon={LuLayoutGrid} type="color"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Localization Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'localization' && (
                <motion.div
                  key="localization"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <InputGroup
                    label="Language" name="language" value={settings.language}
                    onChange={handleChange} icon={LuGlobe} type="select"
                  >
                    <option value="en">English (en)</option>
                    <option value="es">Español (es)</option>
                    <option value="hi">हिन्दी (hi)</option>
                    <option value="ar">العربية (ar)</option>
                  </InputGroup>
                  <InputGroup
                    label="Time Zone" name="timeZone" value={settings.timeZone}
                    onChange={handleChange} icon={LuClock} type="select"
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="Etc/UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </InputGroup>
                  <InputGroup
                    label="Currency" name="currency" value={settings.currency}
                    onChange={handleChange} icon={LuDollarSign} type="select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="BDT">BDT (৳)</option>
                    <option value="EUR">EUR (€)</option>
                  </InputGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- Form Save Button --- */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 font-semibold text-white 
                         bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              <LuSave className="w-5 h-5" />
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * Helper: Tab Button Component
 * ==========================================
 */
const TabButton = ({
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm
                  transition-colors
        ${
          isActive
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
};

/**
 * ==========================================
 * Helper: Form Input Components
 * ==========================================
 */

const InputGroup = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  required = false,
  children,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  icon: React.ElementType;
  type?: string;
  required?: boolean;
  children?: React.ReactNode;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative mt-2">
      <span className="absolute left-3 top-3.5 text-gray-400 z-10">
        <Icon className="w-5 h-5" />
      </span>
      {type === 'select' ? (
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     ${type === 'color' ? 'h-12 p-1' : ''}`}
        />
      )}
    </div>
  </div>
);

const TextAreaGroup = ({
  label,
  name,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  icon: React.ElementType;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-2">
      <span className="absolute left-3 top-3.5 text-gray-400">
        <Icon className="w-5 h-5" />
      </span>
      <textarea
        name={name}
        id={name}
        rows={3}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500"
      ></textarea>
    </div>
  </div>
);

const CustomFileInput = ({ label, name }: { label: string; name: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-2 flex items-center gap-4">
      <img
        src="https://via.placeholder.com/150/EEEEEE/999999?text=Preview"
        alt={label}
        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
      />
      <label
        htmlFor={name}
        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 
                   hover:text-indigo-500"
      >
        <span className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
          <LuUpload className="w-5 h-5" />
          Choose File
        </span>
        <input id={name} name={name} type="file" className="sr-only" />
      </label>
    </div>
  </div>
);
