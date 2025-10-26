'use client';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Total Bots</div>
          <div className="text-3xl font-bold text-indigo-600">5</div>
          <div className="text-xs text-green-600 mt-1">+2 this month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Conversations</div>
          <div className="text-3xl font-bold text-blue-600">1,234</div>
          <div className="text-xs text-green-600 mt-1">+15% vs last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Leads Captured</div>
          <div className="text-3xl font-bold text-green-600">89</div>
          <div className="text-xs text-green-600 mt-1">+23% vs last month</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-2">Active Users</div>
          <div className="text-3xl font-bold text-purple-600">456</div>
          <div className="text-xs text-green-600 mt-1">+8% vs last month</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recent Bots</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-medium">Customer Support Bot {i}</h3>
                <p className="text-sm text-gray-600">Last active 2 hours ago</p>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
