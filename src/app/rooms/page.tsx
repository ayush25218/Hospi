'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuBedDouble,
  LuPlus,
  LuSearch,
  LuFilter,
  LuCircleCheck,
  LuUser,
  LuWrench,
  LuX,
  LuSave,
  LuMove,
  LuLogOut,
  LuBed,
  LuBuilding,
  LuCalendar,
  LuStethoscope,
  LuSprayCan,
} from 'react-icons/lu';

// --- Dummy Data ---
const dummyRooms = [
  {
    id: 1,
    roomNumber: '101-A',
    floor: '1st Floor',
    roomType: 'Private Deluxe',
    status: 'Available',
    patientName: null,
    doctorName: null,
  },
  {
    id: 2,
    roomNumber: '102-B',
    floor: '1st Floor',
    roomType: 'Semi-Private',
    status: 'Occupied',
    patientName: 'Aarav Sharma',
    doctorName: 'Dr. Priya Gupta',
  },
  {
    id: 3,
    roomNumber: '201-A',
    floor: '2nd Floor',
    roomType: 'General Ward',
    status: 'Available',
    patientName: null,
    doctorName: null,
  },
  {
    id: 4,
    roomNumber: '202-B',
    floor: '2nd Floor',
    roomType: 'General Ward',
    status: 'Cleaning',
    patientName: null,
    doctorName: null,
  },
  {
    id: 5,
    roomNumber: '301-ICU',
    floor: '3rd Floor',
    roomType: 'ICU',
    status: 'Occupied',
    patientName: 'Riya Singh',
    doctorName: 'Dr. Rohan Joshi',
  },
  {
    id: 6,
    roomNumber: '302-A',
    floor: '3rd Floor',
    roomType: 'Private',
    status: 'Maintenance',
    patientName: null,
    doctorName: null,
  },
];

const roomTypes = ['All Types', 'Private Deluxe', 'Private', 'Semi-Private', 'General Ward', 'ICU'];
const floors = ['All Floors', '1st Floor', '2nd Floor', '3rd Floor'];
type RoomStatus = 'All' | 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

/**
 * Main Room Allotment Page Component
 */
export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RoomStatus>('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [floorFilter, setFloorFilter] = useState('All Floors');

  // Modal States
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Filter logic
  const filteredRooms = dummyRooms.filter((room) => {
    const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || room.roomType === typeFilter;
    const matchesFloor = floorFilter === 'All Floors' || room.floor === floorFilter;
    const matchesSearch =
      searchTerm === '' ||
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.patientName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesFloor && matchesSearch;
  });

  // Action Handlers
  const openAllotModal = (roomId: number) => {
    setSelectedRoomId(roomId);
    setIsAllotModalOpen(true);
  };

  const closeAllotModal = () => {
    setIsAllotModalOpen(false);
    setSelectedRoomId(null);
  };

  return (
    <div className="space-y-8">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LuBedDouble className="h-8 w-8 text-indigo-700" />
          <h1 className="text-3xl font-bold text-gray-900">Room Allotment & Bed Management</h1>
        </div>
        <button
          onClick={() => {
            setSelectedRoomId(null);
            setIsAllotModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg
                     hover:bg-indigo-700 transition-colors"
        >
          <LuPlus className="w-5 h-5" />
          Allot New Patient
        </button>
      </div>

      {/* --- Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-gray-400"><LuSearch className="w-5 h-5" /></span>
              <input
                type="text"
                placeholder="Search Room or Patient..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* Filter by Room Type */}
          <div className="md:col-span-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {roomTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          {/* Filter by Floor */}
          <div className="md:col-span-1">
            <select
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg appearance-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {floors.map(floor => <option key={floor} value={floor}>{floor}</option>)}
            </select>
          </div>
        </div>
        {/* Quick Filter by Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          {(['All', 'Available', 'Occupied', 'Cleaning', 'Maintenance'] as RoomStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors
                ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* --- Room Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard key={room.id} room={room} onAllotClick={() => openAllotModal(room.id)} />
        ))}
        {filteredRooms.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">No rooms found matching your criteria.</p>
        )}
      </div>

      {/* --- Modals --- */}
      <AllotPatientModal
        isOpen={isAllotModalOpen}
        onClose={closeAllotModal}
        roomId={selectedRoomId}
        allRooms={dummyRooms}
      />
    </div>
  );
}

/**
 * Helper Component: Room Card
 */
function RoomCard({ room, onAllotClick }: { room: (typeof dummyRooms)[0], onAllotClick: () => void }) {
  
  const getStatusProps = () => {
    switch (room.status) {
      case 'Available':
        return { 
          borderColor: 'border-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          icon: <LuCircleCheck className="w-5 h-5" /> 
        };
      case 'Occupied':
        return { 
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          icon: <LuUser className="w-5 h-5" /> 
        };
      case 'Cleaning':
        return { 
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          icon: <LuSprayCan className="w-5 h-5" /> 
        };
      case 'Maintenance':
        return { 
          borderColor: 'border-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          icon: <LuWrench className="w-5 h-5" /> 
        };
      default:
        return { 
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          icon: <LuBed className="w-5 h-5" /> 
        };
    }
  };
  
  const statusProps = getStatusProps();
  
  return (
    <div className={`bg-white rounded-xl shadow-md border-l-4 ${statusProps.borderColor}
                    flex flex-col justify-between transition-all hover:shadow-lg`}>
      {/* Card Header */}
      <div className={`p-4 ${statusProps.bgColor} rounded-t-lg flex items-center justify-between`}>
        <div className={`flex items-center gap-2 font-bold ${statusProps.textColor}`}>
          {statusProps.icon}
          <span className="text-lg">{room.status}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{room.roomNumber}</h2>
        <div className="text-sm text-gray-600">
          <p>{room.roomType}</p>
          <p>{room.floor}</p>
        </div>
        
        {room.status === 'Occupied' && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <LuUser className="w-4 h-4" />
              <span className="text-sm font-medium">{room.patientName}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700 mt-1">
              <LuStethoscope className="w-4 h-4" />
              <span className="text-xs">{room.doctorName}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer (Actions) */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t">
        {room.status === 'Available' && (
          <button 
            onClick={onAllotClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 
                       bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <LuPlus /> Allot Patient
          </button>
        )}
        {room.status === 'Occupied' && (
          <div className="flex gap-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <LuMove className="w-4 h-4" /> Transfer
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <LuLogOut className="w-4 h-4" /> Discharge
            </button>
          </div>
        )}
        {(room.status === 'Cleaning' || room.status === 'Maintenance') && (
           <button className="w-full flex items-center justify-center gap-2 px-4 py-2 
                             bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <LuCircleCheck className="w-4 h-4" /> Mark as Available
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Helper Component: Allot Patient Modal
 */
function AllotPatientModal({ 
  isOpen, 
  onClose, 
  roomId, 
  allRooms 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  roomId: number | null, 
  allRooms: typeof dummyRooms 
}) {
  
  // Get initial room number based on roomId
  const getInitialRoomNumber = () => {
    if (roomId) {
      const selectedRoom = allRooms.find(r => r.id === roomId);
      return selectedRoom ? selectedRoom.roomNumber : '';
    }
    return '';
  };

  // Initialize form with proper default values
  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: '',
    allotmentDate: new Date().toISOString().split('T')[0],
    roomNumber: getInitialRoomNumber(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New Allotment Data:", formData);
    alert('Patient allotted successfully! (Check console for data)');
    
    // Reset form and close modal
    setFormData({
      patientName: '',
      doctorName: '',
      allotmentDate: new Date().toISOString().split('T')[0],
      roomNumber: '',
    });
    onClose();
  };

  const handleModalClose = () => {
    // Reset form when modal closes
    setFormData({
      patientName: '',
      doctorName: '',
      allotmentDate: new Date().toISOString().split('T')[0],
      roomNumber: '',
    });
    onClose();
  };

  // Update room number when modal opens with a specific room
  const handleModalOpen = () => {
    const selectedRoom = allRooms.find(r => r.id === roomId);
    setFormData({
      patientName: '',
      doctorName: '',
      allotmentDate: new Date().toISOString().split('T')[0],
      roomNumber: selectedRoom ? selectedRoom.roomNumber : '',
    });
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
            className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Allot Patient to Room</h2>
              <button
                onClick={handleModalClose}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"
              >
                <LuX className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Room Number (Select Box) */}
              <div>
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">Room</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuBed className="w-5 h-5" /></span>
                  <select
                    name="roomNumber"
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg appearance-none 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select an available room</option>
                    {allRooms
                      .filter(r => r.status === 'Available')
                      .map(r => (
                        <option key={r.id} value={r.roomNumber}>{r.roomNumber} ({r.roomType})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Patient Name */}
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Patient Name</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuUser className="w-5 h-5" /></span>
                  <input
                    type="text"
                    name="patientName"
                    id="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter patient's name"
                  />
                </div>
              </div>

              {/* Doctor Name */}
              <div>
                <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Admitting Doctor</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuStethoscope className="w-5 h-5" /></span>
                  <input
                    type="text"
                    name="doctorName"
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter doctor's name"
                  />
                </div>
              </div>
              
              {/* Allotment Date */}
              <div>
                <label htmlFor="allotmentDate" className="block text-sm font-medium text-gray-700">Allotment Date</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-3.5 text-gray-400"><LuCalendar className="w-5 h-5" /></span>
                   <input
                    type="date"
                    name="allotmentDate"
                    id="allotmentDate"
                    value={formData.allotmentDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  <LuSave className="w-5 h-5" />
                  Allot Room
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
