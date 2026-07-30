import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Star,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  Bell,
  Search,
  Plus,
  ChevronsUpDown,
} from 'lucide-react';

import { Avatar, Dropdown } from '@components/ui';
import { useTheme } from '@contexts/ThemeContext';
import { cn } from '@utils/index';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { label: 'Starred', icon: <Star className="w-5 h-5" />, path: '/starred' },
  { label: 'Members', icon: <Users className="w-5 h-5" />, path: '/members' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 transition-all duration-300 ease-out',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
        )}
      >
        {/* Workspace switcher */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-200 dark:border-surface-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">O</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <button className="flex items-center gap-1 w-full text-left group">
                <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                  My Workspace
                </span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-surface-400 group-hover:text-surface-600 shrink-0" />
              </button>
            </div>
          )}
        </div>

        {/* New Board button */}
        <div className="px-3 py-3">
          <button
            className={cn(
              'btn-primary w-full justify-center',
              sidebarCollapsed ? 'px-2' : 'px-4',
            )}
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>New Board</span>}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800',
                  sidebarCollapsed && 'justify-center px-2',
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!sidebarCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar toggle */}
        <div className="px-3 py-3 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn-icon w-full flex items-center justify-center"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="Search boards..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 border-none text-sm text-surface-700 dark:text-surface-300 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-icon" title="Toggle theme">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button className="btn-icon relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <Dropdown
              trigger={
                <Avatar name="User" size="sm" />
              }
              items={[
                {
                  label: 'Profile',
                  icon: <Settings className="w-4 h-4" />,
                  onClick: () => navigate('/settings'),
                },
                'divider',
                {
                  label: 'Log out',
                  icon: <LogOut className="w-4 h-4" />,
                  onClick: handleLogout,
                  danger: true,
                },
              ]}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
