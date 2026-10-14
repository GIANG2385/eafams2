/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { HomeView } from './components/HomeView';
import { EducationAccountView } from './components/EducationAccountView';
import { FeesView } from './components/FeesView';
import { PaymentFlow } from './components/PaymentFlow';
import { ProfileView } from './components/ProfileView';
import { SandboxModal } from './components/SandboxModal';
import { ApplyFasModal } from './components/ApplyFasModal';
import { PrototypeToolsDrawer } from './components/PrototypeToolsDrawer';
import { EafamsLogo } from './components/EafamsLogo';
import { SignInPage } from './components/SignInPage';
import { Phone, Mail } from 'lucide-react';

const AppContent: React.FC = () => {
  const { route, touchActivity } = usePortal();

  // Reset or touch activity on clicks
  useEffect(() => {
    const handleGlobalClick = () => touchActivity();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [touchActivity]);

  const isPublicPage =
    route.path === '/' ||
    route.path === '/singpass' ||
    route.path === '/login' ||
    route.path === '/signin';

  const renderActiveView = () => {
    switch (route.path) {
      case '/':
        return <LandingPage />;
      case '/singpass':
      case '/login':
      case '/signin':
        return <SignInPage />;
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
      <main className={`flex-1 flex flex-col ${isPublicPage ? '' : 'pb-16'}`}>
        {renderActiveView()}
      </main>

      {/* Bottom Footer Section (matches Screenshot reference) */}
      <footer className="bg-[#0b0e14] text-slate-300 text-xs pt-10 pb-8 px-4 sm:px-6 border-t border-zinc-900 no-print">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Upper Row: Brand + Navigation Links + Social Media */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Brand on the Left */}
            <div className="flex items-center gap-3">
              <EafamsLogo className="h-8 w-auto" variant="dark" />
              <div className="border-l border-zinc-800 pl-3">
                <div className="text-white font-bold text-sm tracking-tight">Eafams</div>
                <div className="text-[11px] text-zinc-400">Education Accounts & Financial Assistance</div>
              </div>
            </div>

            {/* Links and Socials on the Right */}
            <div className="flex flex-wrap items-center gap-5 sm:gap-6">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium text-zinc-300 text-xs">
                <span className="hover:text-white cursor-pointer transition-colors">About Eafams</span>
                <span className="hover:text-white cursor-pointer transition-colors">Fees & Invoices</span>
                <span className="hover:text-white cursor-pointer transition-colors">Education Accounts</span>
                <span className="hover:text-white cursor-pointer transition-colors">FAQ</span>
                <span className="hover:text-white cursor-pointer transition-colors">Contact us</span>
                <span className="hover:text-white cursor-pointer transition-colors">Feedback</span>
              </div>

              {/* 4 Colored Social Icon Circles (Facebook, LinkedIn, Telegram, YouTube) */}
              <div className="flex items-center gap-2">
                {/* Facebook */}
                <a
                  href="#facebook"
                  className="w-7 h-7 rounded-full bg-[#3b5998] hover:opacity-90 flex items-center justify-center text-white transition-opacity"
                  title="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#linkedin"
                  className="w-7 h-7 rounded-full bg-[#0077b5] hover:opacity-90 flex items-center justify-center text-white transition-opacity"
                  title="LinkedIn"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.3a1.59 1.59 0 1 0 0 3.18 1.59 1.59 0 0 0 0-3.18z" />
                  </svg>
                </a>

                {/* Telegram */}
                <a
                  href="#telegram"
                  className="w-7 h-7 rounded-full bg-[#0088cc] hover:opacity-90 flex items-center justify-center text-white transition-opacity"
                  title="Telegram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="#youtube"
                  className="w-7 h-7 rounded-full bg-[#cd201f] hover:opacity-90 flex items-center justify-center text-white transition-opacity"
                  title="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Lower Sub-row: Copyright, Phone, Email */}
          <div className="pt-6 border-t border-zinc-900 text-[11px] text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>&copy; 2026 Eafams &bull; Ministry of Education Singapore</div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>123456789</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>abc@gmail.com</span>
              </div>
            </div>
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
