'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Save,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { api } from '@/src/lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        state: userData.state || '',
        zipCode: userData.zipCode || ''
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await api.put(`/auth/users/${user.id}`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode
      }) as any;

      if (response.data) {
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile intelligence updated successfully.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Security tokens do not match.' });
      return;
    }

    setIsUpdating(true);
    setMessage(null);

    try {
      await api.put(`/auth/users/${user.id}/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage({ type: 'success', text: 'Security protocols updated successfully.' });
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="w-16 h-16 border-4 border-gold-100 border-t-gold-600 rounded-full animate-spin"></div>
      <p className="text-dark-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Identity Vault...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-dark-900 uppercase tracking-tight">Identity & Security</h1>
          <p className="text-dark-400 text-sm font-medium mt-1">Manage your digital profile and encryption settings.</p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
          <ShieldCheck size={20} className="text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-tight">Biometric Auth<br/>Active & Verified</span>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-3xl flex items-center gap-4 animate-fadeIn border-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
          <p className="text-sm font-black uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Profile Information */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden group">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
                <User size={24} />
              </div>
              <h2 className="text-xl font-black text-dark-900 uppercase tracking-tight">Personal Profile</h2>
            </div>
          </div>
          <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Legal Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-300" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-14 pl-14 pr-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gold-500 focus:bg-white outline-none text-sm font-medium transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Email Node</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-200" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full h-14 pl-14 pr-6 bg-gray-50 text-dark-300 rounded-2xl border-2 border-dashed border-gray-100 cursor-not-allowed text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Primary Connection</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-300" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-14 pl-14 pr-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gold-500 focus:bg-white outline-none text-sm font-medium transition-all"
                    placeholder="e.g. +92 300 1234567"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-16 bg-dark-900 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gold-500/10"
            >
              {isUpdating ? <Loader2 size={20} className="animate-spin text-gold-500" /> : <Save size={20} className="text-gold-500" />}
              Commit Identity Updates
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-dark-900 flex items-center justify-center">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-black text-dark-900 uppercase tracking-tight">Security Protocol</h2>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="p-10 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Current Encryption Key</label>
              <div className="relative">
                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full h-14 pl-14 pr-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gold-500 focus:bg-white outline-none text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">New Key</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gold-500 focus:bg-white outline-none text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Re-Verify Key</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gold-500 focus:bg-white outline-none text-sm font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full h-16 bg-white border-2 border-gray-100 text-dark-900 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:border-dark-900 transition-all flex items-center justify-center gap-3"
            >
              {isUpdating ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
              Update Security Tokens
            </button>
          </form>
        </div>

        {/* Address Management */}
        <div className="bg-gray-50 rounded-[3.5rem] p-10 border border-gray-100 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 text-gold-200/10 group-hover:scale-110 transition-transform duration-700">
            <MapPin size={160} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                <MapPin size={24} />
              </div>
              <h2 className="text-xl font-black text-dark-900 uppercase tracking-tight">Delivery Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Primary Node Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-transparent focus:border-gold-500 outline-none text-sm font-medium transition-all shadow-sm"
                  placeholder="House #, Street name"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">City Node</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-transparent focus:border-gold-500 outline-none text-sm font-medium transition-all shadow-sm"
                  placeholder="City"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block ml-1">Region/State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full h-14 px-6 bg-white rounded-2xl border-2 border-transparent focus:border-gold-500 outline-none text-sm font-medium transition-all shadow-sm"
                  placeholder="State"
                />
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button 
                onClick={handleUpdateProfile}
                className="h-12 px-10 bg-dark-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-black transition-all"
              >
                Sync Address Node <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
