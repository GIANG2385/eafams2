/**
 * My Details Screen (FS-08 FR-08.3, Section 7.6)
 * Read-only SingPass identity fields, validated editable contact & mailing fields,
 * field-level audit trail, MSG-0001/0805/0806/0807/0808, and 16+ view-only lock.
 */

import React, { useState, useEffect } from 'react';
import { usePortal } from '../context/PortalContext';
import { ParentProfile } from '../types';
import { MSG } from '../messages';
import { reached } from '../services/clock';
import {
  User,
  Shield,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentParent, linkedStudents, today, updateParentDetailsAction, auditLogs } = usePortal();

  // Check if all linked children are 16+ or parent has no children (AC 9, Section 11 #3)
  const isViewOnlyLocked =
    linkedStudents.length === 0 || linkedStudents.every((s) => reached(s.dob, 16, today));

  // Form state
  const [formData, setFormData] = useState<Partial<ParentProfile>>({
    phoneNumber: currentParent?.phoneNumber || '',
    email: currentParent?.email || '',
    mailingBlock: currentParent?.mailingBlock || '',
    mailingUnit: currentParent?.mailingUnit || '',
    mailingStreet: currentParent?.mailingStreet || '',
    mailingPostalCode: currentParent?.mailingPostalCode || '',
    mailingCountry: currentParent?.mailingCountry || 'Singapore',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if currentParent changes
  useEffect(() => {
    if (currentParent) {
      setFormData({
        phoneNumber: currentParent.phoneNumber || '',
        email: currentParent.email || '',
        mailingBlock: currentParent.mailingBlock || '',
        mailingUnit: currentParent.mailingUnit || '',
        mailingStreet: currentParent.mailingStreet || '',
        mailingPostalCode: currentParent.mailingPostalCode || '',
        mailingCountry: currentParent.mailingCountry || 'Singapore',
      });
    }
  }, [currentParent]);

  if (!currentParent) return null;

  const handleFieldChange = (field: keyof ParentProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setErrors({});

    const res = updateParentDetailsAction(formData);

    if (res.success) {
      setSuccessMessage(res.message || MSG.MSG_0807);
    } else {
      if (res.errors) {
        setErrors(res.errors);
      }
      if (res.message) {
        setErrorMessage(res.message);
      }
    }
  };

  // Recent profile audit logs
  const profileAuditLogs = auditLogs
    .filter((a) => a.entity === 'ParentProfile' && a.entityId === currentParent.id)
    .slice(-5)
    .reverse();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Details</h1>
        <p className="text-xs text-slate-500">
          Manage your verified contact numbers and mailing correspondence address.
        </p>
      </div>

      {/* 16+ Lock Notice (AC 9) */}
      {isViewOnlyLocked && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2.5 font-medium">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{MSG.MY_DETAILS_VIEW_ONLY_TEXT}</span>
        </div>
      )}

      {/* Success / Error Feedback */}
      {successMessage && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Read-Only SingPass Verified Identity (FS-08 6, D-20) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            <Shield className="w-4 h-4 text-[#d82c20]" />
            <span>Singpass Verified Identity (Read-only)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={currentParent.fullName}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">NRIC / FIN</label>
              <input
                type="text"
                readOnly
                value={currentParent.nric}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono font-bold cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Residential Address (from Singpass / NRIC)</span>
              </label>
              <input
                type="text"
                readOnly
                value={currentParent.residentialAddress}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Residential address is maintained via Government Digital Services and cannot be edited in this portal.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Editable Contact Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            <Phone className="w-4 h-4 text-[#1d4f91]" />
            <span>Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Mobile */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                disabled={isViewOnlyLocked}
                value={formData.phoneNumber || ''}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                placeholder="e.g. 9123 4567"
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4f91] ${
                  errors.phoneNumber ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                } ${isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
              {errors.phoneNumber && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.phoneNumber}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                disabled={isViewOnlyLocked}
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="e.g. name@example.com"
                className={`w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4f91] ${
                  errors.email ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                } ${isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
              {errors.email && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Editable Mailing Address */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            <Mail className="w-4 h-4 text-[#1d4f91]" />
            <span>Mailing Address (For physical MOE notices & statements)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Block / House No.</label>
              <input
                type="text"
                disabled={isViewOnlyLocked}
                maxLength={20}
                value={formData.mailingBlock || ''}
                onChange={(e) => handleFieldChange('mailingBlock', e.target.value)}
                placeholder="e.g. 123"
                className={`w-full p-2.5 border rounded-lg border-slate-300 ${
                  isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Unit No.</label>
              <input
                type="text"
                disabled={isViewOnlyLocked}
                maxLength={20}
                value={formData.mailingUnit || ''}
                onChange={(e) => handleFieldChange('mailingUnit', e.target.value)}
                placeholder="e.g. #08-12"
                className={`w-full p-2.5 border rounded-lg border-slate-300 ${
                  isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-bold mb-1">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isViewOnlyLocked}
                maxLength={100}
                value={formData.mailingStreet || ''}
                onChange={(e) => handleFieldChange('mailingStreet', e.target.value)}
                placeholder="e.g. Ang Mo Kio Ave 4"
                className={`w-full p-2.5 border rounded-lg ${
                  errors.mailingStreet ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                } ${isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
              {errors.mailingStreet && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.mailingStreet}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Postal Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isViewOnlyLocked}
                maxLength={6}
                value={formData.mailingPostalCode || ''}
                onChange={(e) => handleFieldChange('mailingPostalCode', e.target.value)}
                placeholder="e.g. 560123"
                className={`w-full p-2.5 border font-mono rounded-lg ${
                  errors.mailingPostalCode
                    ? 'border-rose-500 ring-2 ring-rose-200'
                    : 'border-slate-300'
                } ${isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
              {errors.mailingPostalCode && (
                <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                  {errors.mailingPostalCode}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Country <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isViewOnlyLocked}
                maxLength={100}
                value={formData.mailingCountry || 'Singapore'}
                onChange={(e) => handleFieldChange('mailingCountry', e.target.value)}
                className={`w-full p-2.5 border rounded-lg ${
                  errors.mailingCountry ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300'
                } ${isViewOnlyLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
          </div>
        </div>

        {/* Submit Actions (Hidden if locked in view-only mode) */}
        {!isViewOnlyLocked && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>

      {/* Audit Trail of Profile Changes */}
      {profileAuditLogs.length > 0 && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700 uppercase tracking-wider mb-3">
            <History className="w-4 h-4 text-slate-500" />
            <span>Recent Profile Audit Trail</span>
          </div>
          <div className="space-y-2">
            {profileAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-600 flex justify-between items-center"
              >
                <div>
                  <span className="font-semibold text-slate-800">{log.action}:</span> changed from{' '}
                  <span className="font-mono text-slate-500">"{log.oldValue || 'none'}"</span> to{' '}
                  <span className="font-mono font-bold text-slate-900">"{log.newValue}"</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
