/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { SingpassMockModal } from './components/SingpassMockModal';
import { HomeView } from './components/HomeView';
import { EducationAccountView } from './components/EducationAccountView';
import { FeesView } from './components/FeesView';
import { PaymentFlow } from './components/PaymentFlow';
import { ProfileView } from './components/ProfileView';
import { SandboxModal } from './components/SandboxModal';
import { ApplyFasModal } from './components/ApplyFasModal';
import { PrototypeToolsDrawer } from './components/PrototypeToolsDrawer';

const AppContent: React.FC = () => {
  const { route, touchActivity } = usePortal();

  // Reset or touch activity on clicks
  useEffect(() => {
    const handleGlobalClick = () => touchActivity();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [touchActivity]);

  const renderActiveView = () => {
    switch (route.path) {
      case '/':
        return <LandingPage />;
      case '/singpass':
        return <SingpassMockModal />;
      case '/home':
        return <HomeView />;
      case '/ea':
        return <EducationAccountView />;
      case '/fees':
        return <FeesView />;
      case '/fees/pay':
      case '/fees/review':
      case '/pay/status':
      case '/pay/receipt':
      case '/pay/failed':
        return <PaymentFlow />;
      case '/profile':
        return <ProfileView />;
      case '/sandbox':
        return <SandboxModal />;
      case '/apply-fas':
        return <ApplyFasModal />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-blue-100 selection:text-[#1d4f91]">
      <Header />
      <main className="flex-1 pb-16">{renderActiveView()}</main>

      {/* Official Singapore Gov Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 sm:px-6 border-t border-slate-800 no-print">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#1d4f91] text-white flex items-center justify-center font-bold text-xs">
              MOE
            </span>
            <div>
              <div className="text-white font-semibold">Ministry of Education Singapore</div>
              <div className="text-[11px] text-slate-500">
                Parent e-Service Portal &bull; Education Accounts (F1), Fees & Payments (F9), Portal Spec (FS-08)
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <div>&copy; 2026 Government of Singapore. All rights reserved.</div>
            <div className="mt-0.5">Privacy Statement &bull; Terms of Use &bull; Rate this website</div>
          </div>
        </div>
      </footer>

      {/* Floating Prototype Tools Drawer */}
      <PrototypeToolsDrawer />
    </div>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <AppContent />
    </PortalProvider>
  );
}
