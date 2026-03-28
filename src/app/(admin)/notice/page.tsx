'use client'; // Modals, filters, aur state ke liye zaroori hai

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuMegaphone,
  LuPlus,
  LuSearch,
  LuPin,
  LuPinOff,
  LuPencil,
  LuTrash2,
  LuX,
  LuSave,
  LuOctagonAlert, // Changed from LuAlertOctagon
  LuUsers, // HR
  LuStethoscope, // Clinical
  LuCalendar, // Events
  LuInfo, // General
  LuUserCheck,
} from 'react-icons/lu';

// --- Types ---
type NoticeCategory = 'Urgent' | 'HR' | 'Clinical' | 'Events' | 'General';
type NoticeAudience = 'All Staff' | 'Doctors Only' | 'Nurses Only' | 'Admin';

interface Notice {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  author: string;
  date: string;
  isPinned: boolean;
  audience: NoticeAudience;
}

// --- Dummy Data ---
const dummyNotices: Notice[] = [
  {
    id: 1,
    title: 'CODE RED: Fire Drill - Wing C',
    content: 'This is a scheduled fire drill for Wing C on Nov 5th at 3 PM. All staff must participate.',
    category: 'Urgent',
    author: 'Admin',
    date: '2025-11-04',
    isPinned: true,
    audience: 'All Staff',
  },
  {
    id: 2,
    title: 'Updated Staff Roster (Nov 5 - Nov 12)',
    content: 'The updated weekly staff roster for all departments is now available on the portal.',
    category: 'HR',
    author: 'HR Department',
    date: '2025-11-03',
    isPinned: false,
    audience: 'All Staff',
  },
  {
    id: 3,
    title: 'New Billing Software Training',
    content: 'Mandatory training for the new billing software will be held in Conference Room A at 11 AM tomorrow.',
    category: 'General',
    author: 'IT Department',
    date: '2025-11-02',
    isPinned: false,
    audience: 'Admin',
  },
  {
    id: 4,
    title: 'Blood Donation Camp',
    content: 'A blood donation camp is being organized in the main lobby on Nov 7th. All are welcome.',
    category: 'Events',
    author: 'Management',
    date: '2025-11-01',
    isPinned: false,
    audience: 'All Staff',
  },
  {
    id: 5,
    title: 'New Infection Control Protocol (Protocol 4B)',
    content: 'Effective immediately, all clinical staff must adhere to the new Infection Control Protocol 4B.',
    category: 'Clinical',
    author: 'Dr. Priya Gupta',
    date: '2025-11-04',
    isPinned: false,
    audience: 'Doctors Only',
  },
];

const categories: { name: NoticeCategory; icon: React.ElementType; color: string }[] = [
  { name: 'Urgent', icon: LuOctagonAlert, color: 'red' },
  { name: 'HR', icon: LuUsers, color: 'blue' },
  { name: 'Clinical', icon: LuStethoscope, color: 'green' },
  { name: 'Events', icon: LuCalendar, color: 'purple' },
  { name: 'General', icon: LuInfo, color: 'gray' },
];

/**
 * ==========================================
 * Main Notice Board Page Component
 * ==========================================
 */
export default function NoticeboardPage() {
  const [notices, setNotices] = useState(dummyNotices);
  const [activeTab, setActiveTab] = useState<NoticeCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Filter logic
  const filteredNotices = notices.filter((notice) => {
    const matchesTab = activeTab === 'All' || notice.category === activeTab;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

  // Action Handlers
  const openModal = (notice: Notice | null = null) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotice(null);
  };

  const handleSave = (notice: Notice) => {
    if (editingNotice) {
      setNotices(notices.map((n) => (n.id === notice.id ? notice : n)));
    } else {
      setNotices([notice, ...notices]);
    }
    closeModal();
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };
  
  const togglePin = (id: number) => {
    setNotices(notices.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuMegaphone className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Notice Board</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          Add New Notice
        </button>
      </div>

      {/* --- Filters & Search --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute left-3 top-3.5 text-gray-400"><LuSearch className="w-5 h-5" /></span>
          <input
            type="text"
            placeholder="Search notices by title or content..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <FilterTab
            label="All"
            isActive={activeTab === 'All'}
            onClick={() => setActiveTab('All')}
          />
          {categories.map(cat => (
             <FilterTab
              key={cat.name}
              label={cat.name}
              isActive={activeTab === cat.name}
              onClick={() => setActiveTab(cat.name)}
              color={cat.color}
            />
          ))}
        </div>
      </div>

      {/* --- Pinned Notices --- */}
      {pinnedNotices.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <LuPin className="text-indigo-600" />
            Pinned Notices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pinnedNotices.map((notice) => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                onEdit={() => openModal(notice)}
                onDelete={() => handleDelete(notice.id)}
                onPin={() => togglePin(notice.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* --- All Notices --- */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          All Notices
        </h2>
        {regularNotices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regularNotices.map((notice) => (
              <NoticeCard 
                key={notice.id} 
                notice={notice} 
                onEdit={() => openModal(notice)}
                onDelete={() => handleDelete(notice.id)}
                onPin={() => togglePin(notice.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No notices found.</p>
        )}
      </section>

      {/* --- Add/Edit Modal --- */}
      <AddNoticeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        notice={editingNotice}
      />
    </div>
  );
}

/**
 * ==========================================
 * Helper Components
 * ==========================================
 */

// --- Filter Tab Button ---
const FilterTab = ({ label, isActive, onClick, color = 'gray' }: {
  label: string; isActive: boolean; onClick: () => void; color?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border
      ${
        isActive
          ? `bg-${color}-600 text-white border-${color}-600`
          : `bg-white text-gray-700 border-gray-300 hover:bg-gray-50`
      }`}
  >
    {label}
  </button>
);

// --- Notice Card ---
const NoticeCard = ({ notice, onEdit, onDelete, onPin }: {
  notice: Notice;
  onEdit: () => void;
  onDelete: () => void;
  onPin: () => void;
}) => {
  const category = categories.find(c => c.name === notice.category) || categories[4];
  const CategoryIcon = category.icon;

  return (
    <div className={`bg-white rounded-xl shadow-md border-l-4 border-${category.color}-500`}>
      <div className="p-5">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center gap-2 text-sm font-bold text-${category.color}-600`}>
            <CategoryIcon className="w-5 h-5" />
            <span>{notice.category}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100" title="Edit">
              <LuPencil className="w-4 h-4" />
            </button>
            <button onClick={onPin} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100" title={notice.isPinned ? "Unpin" : "Pin to Top"}>
              {notice.isPinned ? <LuPinOff className="w-4 h-4" /> : <LuPin className="w-4 h-4" />}
            </button>
            <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100" title="Delete">
              <LuTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
        <p className="text-gray-700 text-sm mb-4">{notice.content}</p>

        {/* Footer */}
        <div className="border-t pt-3 text-xs text-gray-500 flex justify-between">
          <span>By: <span className="font-medium">{notice.author}</span> ({notice.date})</span>
          <span className="font-medium flex items-center gap-1">
            {notice.audience === 'All Staff' ? <LuUsers className="w-4 h-4" /> : <LuUserCheck className="w-4 h-4" />}
            {notice.audience}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Add/Edit Notice Modal ---
const AddNoticeModal = ({ isOpen, onClose, onSave, notice }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: Notice) => void;
  notice: Notice | null;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General' as NoticeCategory,
    audience: 'All Staff' as NoticeAudience,
    isPinned: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalNotice: Notice = {
      ...formData,
      id: notice ? notice.id : Date.now(),
      author: 'Admin',
      date: new Date().toISOString().split('T')[0],
    };
    onSave(finalNotice);
    
    // Reset form after save
    setFormData({
      title: '', 
      content: '', 
      category: 'General', 
      audience: 'All Staff', 
      isPinned: false,
    });
  };

  // Reset form when modal opens
  const handleModalOpen = () => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        audience: notice.audience,
        isPinned: notice.isPinned,
      });
    } else {
      setFormData({
        title: '', 
        content: '', 
        category: 'General', 
        audience: 'All Staff', 
        isPinned: false,
      });
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onAnimationStart={handleModalOpen}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {notice ? 'Edit Notice' : 'Add New Notice'}
              </h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text" name="title" id="title" value={formData.title} onChange={handleChange}
                  required
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Notice Title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category" id="category" value={formData.category} onChange={handleChange}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg appearance-none 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience (For)</label>
                  <select
                    name="audience" id="audience" value={formData.audience} onChange={handleChange}
                    className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg appearance-none 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All Staff">All Staff</option>
                    <option value="Doctors Only">Doctors Only</option>
                    <option value="Nurses Only">Nurses Only</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  name="content" id="content" value={formData.content} onChange={handleChange}
                  rows={6} required
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Write the notice details here..."
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isPinned"
                  id="isPinned"
                  checked={formData.isPinned}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
                  Pin this notice to the top
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                  <LuSave className="w-5 h-5" />
                  {notice ? 'Save Changes' : 'Post Notice'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
