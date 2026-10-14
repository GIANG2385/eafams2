/**
 * Education Account View (FS-08 6.2)
 * Full transaction ledger, date/type/flow filters, pagination (20/page),
 * online payment status badges, Continue payment button, and PDF statement preview.
 */

import React, { useState, useMemo } from 'react';
import { usePortal } from '../context/PortalContext';
import { Function1Service } from '../services/function1';
import { formatSGD, formatDateDDMMYYYY, CONFIG } from '../config';
import { MSG } from '../messages';
import { StatementModal } from './StatementModal';
import {
  GraduationCap,
  Download,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  FileText,
} from 'lucide-react';

export const EducationAccountView: React.FC = () => {
  const {
    currentParent,
    linkedStudents,
    getStudentEa,
    ledgerEntries,
    route,
    navigate,
    today,
  } = usePortal();

  // Selected student: 'ALL' or specific studentId
  const initialStudentId = route.studentId || (linkedStudents.length > 0 ? linkedStudents[0].id : 'ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);

  // Filter form state (draft until "Apply filter" clicked)
  const [filterFrom, setFilterFrom] = useState<string>('');
  const [filterTo, setFilterTo] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterFlow, setFilterFlow] = useState<string>('All');

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    from: '',
    to: '',
    type: 'All',
    flow: 'All',
  });

  // Statement PDF preview modal
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [statementError, setStatementError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Security Ownership Check (FS-08 AC 13)
  const activeStudent = useMemo(() => {
    if (selectedStudentId === 'ALL') return null;
    return linkedStudents.find((s) => s.id === selectedStudentId);
  }, [linkedStudents, selectedStudentId]);

  // If navigating directly to a student not belonging to parent -> MSG-0003 (AC 13)
  if (selectedStudentId !== 'ALL' && !activeStudent) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-rose-900 mb-2">{MSG.MSG_0003}</h2>
          <p className="text-xs text-rose-700 mb-6">
            You do not have authorization to access this student's Education Account records.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-[#1d4f91] text-white text-xs font-semibold rounded-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Active student EA view
  const activeAccount = activeStudent ? getStudentEa(activeStudent.id) : undefined;
  const activeEaView = activeStudent
    ? Function1Service.getEaView(activeStudent, activeAccount, today)
    : null;

  // Handle Apply Filter
  const handleApplyFilter = () => {
    setAppliedFilters({
      from: filterFrom,
      to: filterTo,
      type: filterType,
      flow: filterFlow,
    });
    setCurrentPage(1); // Reset to page 1
  };

  const handleResetFilter = () => {
    setFilterFrom('');
    setFilterTo('');
    setFilterType('All');
    setFilterFlow('All');
    setAppliedFilters({
      from: '',
      to: '',
      type: 'All',
      flow: 'All',
    });
    setCurrentPage(1);
  };

  // Filtered ledger entries
  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      // 1. Student filter
      if (selectedStudentId !== 'ALL') {
        const studentAcc = activeAccount?.accountNumber;
        if (!studentAcc || entry.accountNumber !== studentAcc) {
          return false;
        }
      } else {
        // Must belong to one of parent's linked students
        const parentAccNumbers = linkedStudents
          .map((s) => getStudentEa(s.id)?.accountNumber)
          .filter(Boolean);
        if (!parentAccNumbers.includes(entry.accountNumber)) {
          return false;
        }
      }

      // 2. Date From filter
      if (appliedFilters.from && entry.date < appliedFilters.from) {
        return false;
      }

      // 3. Date To filter
      if (appliedFilters.to && entry.date > appliedFilters.to) {
        return false;
      }

      // 4. Type filter: Top-up, Fee payment, Closure transfer
      if (appliedFilters.type !== 'All') {
        if (entry.type !== appliedFilters.type) {
          return false;
        }
      }

      // 5. Money flow filter: Money in / Money out
      if (appliedFilters.flow === 'in' && entry.direction !== 'in') {
        return false;
      }
      if (appliedFilters.flow === 'out' && entry.direction !== 'out') {
        return false;
      }

      return true;
    });
  }, [ledgerEntries, selectedStudentId, activeAccount, linkedStudents, getStudentEa, appliedFilters]);

  // Pagination calculation (20 per page)
  const totalEntries = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / CONFIG.PAGE_SIZE_TX));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * CONFIG.PAGE_SIZE_TX;
    return filteredEntries.slice(start, start + CONFIG.PAGE_SIZE_TX);
  }, [filteredEntries, currentPage]);

  const handleOpenStatement = () => {
    setStatementError(null);
    if (!activeStudent || !activeAccount) {
      setStatementError(MSG.MSG_0804);
      return;
    }
    setShowStatementModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Student Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Education Account</h1>
          <p className="text-xs text-slate-500">Official statement of ledger balances and transaction history.</p>
        </div>

        {/* Student Selector Tabs */}
        {linkedStudents.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => {
                setSelectedStudentId('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedStudentId === 'ALL'
                  ? 'bg-white text-[#1d4f91] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Students
            </button>
            {linkedStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedStudentId(s.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedStudentId === s.id
                    ? 'bg-white text-[#1d4f91] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.fullName.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account Info Header Card (Single Student Mode) */}
      {activeStudent && activeEaView && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-lg font-bold text-slate-900">{activeStudent.fullName}</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    activeEaView.badgeVariant === 'green'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeEaView.badgeVariant === 'amber'
                      ? 'bg-amber-100 text-amber-900'
                      : activeEaView.badgeVariant === 'slate'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {activeEaView.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {activeAccount ? `A/C: ${activeAccount.accountNumber}` : 'No active account'} &bull; NRIC:{' '}
                {activeStudent.nric}
              </div>
              {activeAccount?.closedAt && (
                <div className="text-xs text-slate-500 mt-1">
                  Closed on: {formatDateDDMMYYYY(activeAccount.closedAt.split('T')[0])}
                </div>
              )}
            </div>

            {/* Current Balance / Status */}
            <div className="flex items-center gap-4 sm:text-right">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Available Balance
                </div>
                {activeEaView.showBalance ? (
                  <div className="text-2xl font-black text-[#1d4f91]">
                    {formatSGD(activeEaView.balanceCents || 0)}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-medium italic mt-1">
                    {activeEaView.displayText}
                  </div>
                )}
              </div>

              {/* Download Statement PDF (AC 12) */}
              <button
                onClick={handleOpenStatement}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1d4f91] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-2xs self-center"
                title="Download statement (PDF)"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Statement (PDF)</span>
              </button>
            </div>
          </div>

          {statementError && (
            <div className="mt-3 p-2.5 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{statementError}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter Toolbar (FS-08 6.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          <Filter className="w-3.5 h-3.5 text-[#1d4f91]" />
          <span>Filter Transactions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
            >
              <option value="All">All Types</option>
              <option value="Top-up">Top-up</option>
              <option value="Fee payment">Fee payment</option>
              <option value="Closure transfer">Closure transfer</option>
            </select>
          </div>

          {/* Money Flow */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Money Flow</label>
            <select
              value={filterFlow}
              onChange={(e) => setFilterFlow(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1d4f91]"
            >
              <option value="All">All Flows</option>
              <option value="in">Money In (+)</option>
              <option value="out">Money Out (-)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {appliedFilters.from || appliedFilters.to || appliedFilters.type !== 'All' || appliedFilters.flow !== 'All' ? (
              <span className="font-medium text-blue-900">Filters applied</span>
            ) : (
              <span>Showing all transactions</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilter}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilter}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#1d4f91] hover:bg-[#163e72] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apply filter
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Table / Empty State */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {paginatedEntries.length === 0 ? (
          // MSG-0803 (AC 11)
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">{MSG.MSG_0803}</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your date range, type, or money flow filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Date</th>
                  {selectedStudentId === 'ALL' && <th className="py-3 px-4 font-bold">Student</th>}
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 font-bold text-right">Amount</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEntries.map((entry) => {
                  const studentForEntry = linkedStudents.find((s) => {
                    const ea = getStudentEa(s.id);
                    return ea?.accountNumber === entry.accountNumber;
                  });

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                        {formatDateDDMMYYYY(entry.date)}
                      </td>
                      {selectedStudentId === 'ALL' && (
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {studentForEntry?.fullName || '-'}
                        </td>
                      )}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{entry.type}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-slate-900 font-medium">{entry.description}</div>
                        {entry.channel === 'online' && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded uppercase">
                            online
                          </span>
                        )}
                        {entry.fundingReference && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {entry.fundingReference}
                          </div>
                        )}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          entry.direction === 'in' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {entry.direction === 'in' ? '+' : '-'}
                        {formatSGD(entry.amountCents).replace('SGD ', '')}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            entry.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : entry.status === 'Pending'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {/* Pending online transaction has "Continue payment" button (FS-08 6.2) */}
                        {entry.status === 'Pending' && entry.channel === 'online' ? (
                          <button
                            onClick={() =>
                              navigate('/sandbox', {
                                sandboxSessionId: entry.fundingReference,
                              })
                            }
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-2xs transition-colors cursor-pointer"
                          >
                            Continue payment
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar (20 rows per page) */}
        {totalEntries > 0 && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing <span className="font-bold">{(currentPage - 1) * CONFIG.PAGE_SIZE_TX + 1}</span> to{' '}
              <span className="font-bold">
                {Math.min(currentPage * CONFIG.PAGE_SIZE_TX, totalEntries)}
              </span>{' '}
              of <span className="font-bold">{totalEntries}</span> transactions
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statement Modal Preview */}
      {showStatementModal && activeStudent && activeAccount && (
        <StatementModal
          student={activeStudent}
          account={activeAccount}
          entries={filteredEntries}
          filterFrom={appliedFilters.from}
          filterTo={appliedFilters.to}
          onClose={() => setShowStatementModal(false)}
        />
      )}
    </div>
  );
};
