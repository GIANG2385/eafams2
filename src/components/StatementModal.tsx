/**
 * Statement Modal Preview (FS-08 6.2, AC 12)
 * Renders an official printable/downloadable Singapore MOE Education Account statement.
 */

import React from 'react';
import { StudentProfile, EducationAccount, EaLedgerEntry } from '../types';
import { formatSGD, formatDateDDMMYYYY } from '../config';
import { X, Printer, Download, GraduationCap } from 'lucide-react';

interface StatementModalProps {
  student: StudentProfile;
  account: EducationAccount;
  entries: EaLedgerEntry[];
  filterFrom?: string;
  filterTo?: string;
  onClose: () => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  student,
  account,
  entries,
  filterFrom,
  filterTo,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Actions */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <GraduationCap className="w-4 h-4 text-[#1d4f91]" />
            <span>Official Statement of Account Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 overflow-y-auto flex-1 printable-card bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#1d4f91] pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 bg-[#1d4f91] text-white text-xs font-bold rounded flex items-center justify-center">
                  MOE
                </span>
                <span className="text-xl font-bold tracking-tight text-[#1d4f91]">
                  MINISTRY OF EDUCATION SINGAPORE
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Education Account &bull; Statement of Account
              </h1>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Statement Generated:</div>
              <div className="font-mono font-bold text-slate-800">
                {new Date().toLocaleDateString('en-SG', { timeZone: 'Asia/Singapore' })}
              </div>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Student Name:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.fullName}</div>
              <div className="text-[11px] font-mono text-slate-500">{student.nric}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Account Number:</span>
              <div className="font-bold font-mono text-slate-900 mt-0.5">{account.accountNumber}</div>
              <div className="text-[11px] text-slate-500">Created: {formatDateDDMMYYYY(account.createdAt.split('T')[0])}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Current Balance:</span>
              <div className="font-extrabold text-[#1d4f91] text-base mt-0.5">
                {formatSGD(account.balanceCents)}
              </div>
              <div className="text-[11px] text-slate-500">Status: {account.status}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Filter Period:</span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {filterFrom ? formatDateDDMMYYYY(filterFrom) : 'Beginning'} -{' '}
                {filterTo ? formatDateDDMMYYYY(filterTo) : 'Present'}
              </div>
              <div className="text-[11px] text-slate-500">Entries Shown: {entries.length}</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 uppercase text-[10px]">
                <th className="py-2.5 font-bold">Date</th>
                <th className="py-2.5 font-bold">Type</th>
                <th className="py-2.5 font-bold">Description</th>
                <th className="py-2.5 font-bold">Reference</th>
                <th className="py-2.5 font-bold text-right">Amount (SGD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((item) => (
                <tr key={item.id} className="py-2">
                  <td className="py-2.5 font-mono text-slate-600">{formatDateDDMMYYYY(item.date)}</td>
                  <td className="py-2.5 font-medium">{item.type}</td>
                  <td className="py-2.5 text-slate-800 max-w-[220px]">
                    <div>{item.description}</div>
                    {item.channel === 'online' && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1 py-0.2 rounded font-semibold">
                        Online Payment
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                    {item.fundingReference || '-'}
                  </td>
                  <td
                    className={`py-2.5 text-right font-mono font-bold ${
                      item.direction === 'in' ? 'text-emerald-700' : 'text-slate-900'
                    }`}
                  >
                    {item.direction === 'in' ? '+' : '-'}
                    {formatSGD(item.amountCents).replace('SGD ', '')}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No transactions recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Statement Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex items-center justify-between">
            <span>This is an official computer-generated statement issued by Ministry of Education Singapore.</span>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
