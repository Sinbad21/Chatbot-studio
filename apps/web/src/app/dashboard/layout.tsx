'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Bots', href: '/dashboard/bots' },
  { name: 'Analytics', href: '/dashboard/analytics' },
  { name: 'Leads', href: '/dashboard/leads' },
  { name: 'Integrations', href: '/dashboard/integrations' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">Chatbot Studio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">user@example.com</span>
              <button className="text-sm text-gray-600 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-lg ${
                  pathname === item.href
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
