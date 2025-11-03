'use client'; // Modals, state, aur interactions ke liye zaroori hai

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuFileCog,
  LuUpload,
  LuFolderPlus,
  LuSearch,
  LuHardDrive,
  LuFolder,
  LuFileText,
  LuImage,
  LuFile,
  LuX,
  LuSave,
  LuChevronRight,
  LuFileSpreadsheet, // For CSV/Excel
  LuEllipsisVertical,
} from 'react-icons/lu';

// --- Dummy Data ---
// (Asli app mein, yeh data API se aayega)
const initialFiles = [
  {
    id: 1,
    type: 'folder',
    name: 'Patient Records',
    size: '15.2 GB',
    lastModified: '2025-10-28',
  },
  {
    id: 2,
    type: 'folder',
    name: 'Staff Documents',
    size: '2.1 GB',
    lastModified: '2025-10-25',
  },
  {
    id: 3,
    type: 'folder',
    name: 'Billing & Invoices',
    size: '500 MB',
    lastModified: '2025-10-29',
  },
  {
    id: 4,
    type: 'file',
    fileType: 'pdf',
    name: 'Hospital_Policy_v3.pdf',
    size: '1.2 MB',
    lastModified: '2025-10-20',
  },
  {
    id: 5,
    type: 'file',
    fileType: 'image',
    name: 'Main_Lobby_Photo.jpg',
    size: '4.8 MB',
    lastModified: '2025-09-15',
  },
  {
    id: 6,
    type: 'file',
    fileType: 'doc',
    name: 'Weekly_Staff_Roster.xlsx',
    size: '300 KB',
    lastModified: '2025-10-29',
  },
];
// --------------------

type FileItem = (typeof initialFiles)[0];
type FileTypeFilter = 'all' | 'pdf' | 'image' | 'doc';

/**
 * ==========================================
 * Main File Manager Page Component
 * ==========================================
 */
export default function FileManagerPage() {
  const [files] = useState(initialFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FileTypeFilter>('all');
  
  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

  // Breadcrumbs (for folder navigation)
  const [path] = useState(['Home']);

  // Filter logic
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (file.type === 'file' && file.fileType === filter) ||
      file.type === 'folder'; // Folders ko hamesha dikhayein

    return matchesSearch && matchesFilter;
  });
  
  // (Yahaan folder create/delete/navigation ka poora logic add hoga)

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuFileCog className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">File Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFolderModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg
                       hover:bg-gray-700 transition-colors"
          >
            <LuFolderPlus className="w-5 h-5" />
            New Folder
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                       hover:bg-indigo-700 transition-colors"
          >
            <LuUpload className="w-5 h-5" />
            Upload File
          </button>
        </div>
      </div>

      {/* --- Toolbar & Storage --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-3.5 text-gray-400"><LuSearch className="w-5 h-5" /></span>
            <input
              type="text"
              placeholder="Search files and folders..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <FilterButton label="All" filter='all' activeFilter={filter} setFilter={setFilter} />
            <FilterButton label="PDFs" filter='pdf' activeFilter={filter} setFilter={setFilter} />
            <FilterButton label="Images" filter='image' activeFilter={filter} setFilter={setFilter} />
            <FilterButton label="Docs" filter='doc' activeFilter={filter} setFilter={setFilter} />
          </div>
        </div>
        
        {/* Storage Quota */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-gray-700 flex items-center gap-2">
              <LuHardDrive className="w-5 h-5 text-indigo-600" />
              Storage
            </span>
            <span className="text-gray-500">18.1 GB of 100 GB Used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '18.1%' }}></div>
          </div>
        </div>
      </div>
      
      {/* --- Breadcrumbs --- */}
      <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
        {path.map((p, index) => (
          <div key={p} className="flex items-center gap-2">
            <a href="#" className="hover:text-indigo-600">{p}</a>
            {index < path.length - 1 && <LuChevronRight className="w-4 h-4" />}
          </div>
        ))}
      </nav>

      {/* --- Files Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFiles.map((item) =>
          item.type === 'folder' ? (
            <FolderCard key={item.id} item={item} />
          ) : (
            <FileCard key={item.id} item={item} />
          )
        )}
      </div>

      {/* --- Modals --- */}
      <NewFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
      <UploadFileModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}

/**
 * ==========================================
 * Helper Components
 * ==========================================
 */

// --- Filter Button ---
const FilterButton = ({ label, filter, activeFilter, setFilter }: {
  label: string;
  filter: FileTypeFilter;
  activeFilter: FileTypeFilter;
  setFilter: (filter: FileTypeFilter) => void;
}) => (
  <button
    onClick={() => setFilter(filter)}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
      ${
        activeFilter === filter
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
  >
    {label}
  </button>
);

// --- Get File Icon (Helper) ---
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf': return <LuFileText className="w-10 h-10 text-red-500" />;
    case 'image': return <LuImage className="w-10 h-10 text-blue-500" />;
    case 'doc': return <LuFileSpreadsheet className="w-10 h-10 text-green-500" />;
    default: return <LuFile className="w-10 h-10 text-gray-500" />;
  }
};

// --- Folder Card ---
const FolderCard = ({ item }: { item: FileItem }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between transition-all hover:shadow-lg hover:cursor-pointer">
    <div className="flex items-center gap-3 overflow-hidden">
      <LuFolder className="w-10 h-10 text-indigo-500 flex-shrink-0" />
      <div className="overflow-hidden">
        <p className="text-base font-bold text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">{item.size}</p>
      </div>
    </div>
    <FileActions />
  </div>
);

// --- File Card ---
const FileCard = ({ item }: { item: FileItem }) => (
  <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between transition-all hover:shadow-lg">
    <div className="flex items-center gap-3 overflow-hidden">
      {getFileIcon(item.fileType || 'file')}
      <div className="overflow-hidden">
        <p className="text-base font-bold text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">{item.size} - {item.lastModified}</p>
      </div>
    </div>
    <FileActions />
  </div>
);

// --- File Actions Dropdown (Optional, but very professional) ---
const FileActions = () => (
  <div className="relative flex-shrink-0">
    <button className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
      <LuEllipsisVertical className="w-5 h-5" />
    </button>
    {/* (Yahaan aap ek poora dropdown menu logic add kar sakte hain) */}
    {/* Example Actions:
      <div className="absolute right-0 top-8 z-10 bg-white shadow-lg rounded-lg w-48">
        <a href="#" className="flex items-center gap-2 p-3 hover:bg-gray-50"><LuDownload /> Download</a>
        <a href="#" className="flex items-center gap-2 p-3 hover:bg-gray-50"><LuPencil /> Rename</a>
        <a href="#" className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50"><LuTrash2 /> Delete</a>
      </div>
    */}
  </div>
);

// --- New Folder Modal ---
const NewFolderModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [folderName, setFolderName] = useState('');
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Creating folder:", folderName);
    onClose();
    setFolderName('');
  };
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create New Folder</h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700">Folder Name</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuFolder className="w-5 h-5" /></span>
                  <input
                    type="text"
                    name="folderName"
                    id="folderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Patient X-Rays"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">
                  <LuSave className="w-5 h-5" />
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Upload File Modal ---
const UploadFileModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Files</h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Dropzone Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <LuUpload className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-600">Drag & drop files here</p>
              <p className="text-sm text-gray-500">or</p>
              <button className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200">
                Browse Files
              </button>
            </div>
            
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
