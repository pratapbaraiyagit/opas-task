import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-purple relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl animate-float animate-delay-200" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent-teal/10 rounded-full blur-3xl animate-float animate-delay-300" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <path d="M8 12h8M12 8v8" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">Opash Software task</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Collaborate in
              <br />
              <span className="text-white/90">real-time.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Whiteboard, notes, and meeting tools — all in one place. Built for teams that
              move fast.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div
                  key={letter}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-sm font-medium"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">Join 10,000+ teams already using Opash Software task</p>
          </div>
        </div>
      </div>

      {/* Right side — auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-md animate-fade-up">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
