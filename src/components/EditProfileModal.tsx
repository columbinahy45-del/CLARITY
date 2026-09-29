import React, { useState, useEffect } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import { X, MapPin, User, Building, Check, Mail, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    currentUser,
    updateUserProfile,
    theme,
    isEditProfileModalOpen,
    closeEditProfileModal,
  } = useClassTrack();

  const isDark = theme === 'dark';
  const isOpen = propIsOpen !== undefined ? propIsOpen : isEditProfileModalOpen;
  const onClose = propOnClose || closeEditProfileModal;

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [institution, setInstitution] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setDepartment(currentUser.department || '');
      setInstitution(currentUser.institution || 'Central Campus');
      setStreetAddress(currentUser.address || '');
      setCity(currentUser.city || '');
      setStateProvince(currentUser.state || '');
      setZipCode(currentUser.zipCode || '');
      setIsSaved(false);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      department: department.trim(),
      institution: institution.trim(),
      address: streetAddress.trim(),
      city: city.trim(),
      state: stateProvince.trim(),
      zipCode: zipCode.trim(),
    });

    setIsSaved(true);
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-lg p-5 sm:p-7 rounded-3xl transition-all relative my-auto border shadow-2xl max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-[#111116] text-white border-neutral-800 shadow-[0_20px_60px_rgba(0,0,0,0.9)]'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight leading-tight">
              Edit Address & Profile
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Update your account details and campus mailing address
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Identity Bar (Read-only Account Details) */}
          <div className={`p-3.5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#161622] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-neutral-400 font-mono text-[11px]">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span className="truncate">{currentUser.email}</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : currentUser.role === 'teacher'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  : 'bg-pink-500/20 text-pink-400 border-pink-500/30'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isDark ? 'bg-[#181824] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Department & Institution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Department / Major</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark ? 'bg-[#181824] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Institution / Campus</label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. Central University"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark ? 'bg-[#181824] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#161622] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="block font-bold text-[11px] text-pink-400 uppercase tracking-wider">
              Mailing & Residential Address
            </span>

            <div>
              <label className="block text-neutral-400 mb-1 text-[11px] font-medium">Street Address</label>
              <input
                type="text"
                placeholder="e.g. 104 Academic Way, Apt 2B"
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                  isDark ? 'bg-[#1f1f2e] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-neutral-400 mb-1 text-[11px] font-medium">City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark ? 'bg-[#1f1f2e] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 text-[11px] font-medium">State / Province</label>
                <input
                  type="text"
                  placeholder="State / Region"
                  value={stateProvince}
                  onChange={e => setStateProvince(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
                    isDark ? 'bg-[#1f1f2e] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 text-[11px] font-medium">Postal / ZIP Code</label>
                <input
                  type="text"
                  placeholder="e.g. 94016"
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl font-mono border text-xs focus:outline-none transition-colors ${
                    isDark ? 'bg-[#1f1f2e] border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-colors cursor-pointer border ${
                isDark
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                isSaved
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : isDark
                  ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black border-pink-400 shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                  : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-md'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
