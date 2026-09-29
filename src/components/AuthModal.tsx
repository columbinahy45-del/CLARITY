import React, { useState, useEffect } from 'react';
import { useClassTrack } from '../context/ClassTrackContext';
import {
  X,
  Lock,
  Mail,
  User,
  MapPin,
  Building,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    signIn,
    signUp,
    theme,
  } = useClassTrack();

  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setEmail('');
    setPassword('');
    setStreetAddress('');
    setCity('');
    setStateProvince('');
    setZipCode('');
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password.trim()) {
          setError('Please enter both email and password.');
          setIsLoading(false);
          return;
        }
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.message || 'Invalid email or password.');
        }
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }
        const res = await signUp(
          {
            name: name.trim(),
            email: email.trim(),
            role,
            institution: institution.trim() || 'State University',
            department: department.trim() || (role === 'teacher' ? 'General Faculty' : undefined),
            address: streetAddress.trim() || undefined,
            city: city.trim() || undefined,
            state: stateProvince.trim() || undefined,
            zipCode: zipCode.trim() || undefined,
            theme,
          },
          password
        );
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-3xl transition-all relative my-auto border ${
          isDark
            ? 'bg-[#111116] text-white border-neutral-800 shadow-[0_0_50px_rgba(255,45,117,0.2)]'
            : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}
      >
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-bold text-lg mb-3 ${
              isDark
                ? 'bg-[#ff2d75] text-black shadow-[0_0_20px_rgba(255,45,117,0.6)]'
                : 'bg-[#0ea5e9] text-white shadow-md'
            }`}
          >
            CT
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
            {mode === 'signin' ? 'Sign In' : 'Create an Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'signin'
              ? 'Enter your credentials to access your classes and coursework'
              : 'Register your account with complete address and academic details'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div
          className={`grid grid-cols-2 p-1 rounded-2xl mb-5 text-xs font-semibold ${
            isDark ? 'bg-[#181822]' : 'bg-slate-100'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'signin'
                ? isDark
                  ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? isDark
                  ? 'bg-[#ff2d75] text-black font-bold shadow-[0_0_12px_rgba(255,45,117,0.4)]'
                  : 'bg-white text-slate-900 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl text-xs bg-rose-950/60 text-rose-300 border border-rose-800/40">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none transition-colors ${
                      isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Account Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-2xl focus:outline-none ${
                      isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <option value="student">Student Account</option>
                    <option value="teacher">Faculty / Teacher Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Department / Field</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-2xl focus:outline-none ${
                      isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Address Fillout */}
              <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                isDark ? 'bg-[#14141e] border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-pink-400 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mailing & Campus Address Fillout</span>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 text-[11px] font-medium">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Academic Blvd, Apt 4B"
                    value={streetAddress}
                    onChange={e => setStreetAddress(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl focus:outline-none transition-colors text-xs ${
                      isDark ? 'bg-[#1a1a26] text-white border border-neutral-700' : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px] font-medium">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl focus:outline-none text-xs ${
                        isDark ? 'bg-[#1a1a26] text-white border border-neutral-700' : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px] font-medium">State / Prov</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={stateProvince}
                      onChange={e => setStateProvince(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl focus:outline-none text-xs ${
                        isDark ? 'bg-[#1a1a26] text-white border border-neutral-700' : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 text-[11px] font-medium">Zip / Postal</label>
                    <input
                      type="text"
                      placeholder="10001"
                      value={zipCode}
                      onChange={e => setZipCode(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl focus:outline-none font-mono text-xs ${
                        isDark ? 'bg-[#1a1a26] text-white border border-neutral-700' : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Email Address *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none transition-colors ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Password *</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-2xl focus:outline-none transition-colors ${
                  isDark ? 'bg-[#181824] text-white' : 'bg-slate-100 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer mt-2 ${
              isDark
                ? 'bg-[#ff2d75] hover:bg-[#ff1767] text-black shadow-[0_0_20px_rgba(255,45,117,0.4)]'
                : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md'
            }`}
          >
            {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
