import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const statsRes = await axios.get('/api/tickets/stats', config);
        setStats(statsRes.data);
        
        const ticketsRes = await axios.get('/api/tickets?sort=createdAt&order=desc', config);
        const allTickets = ticketsRes.data.result || ticketsRes.data.empResult || ticketsRes.data.techResult || [];
        setRecentTickets(allTickets.slice(0, 5));
        
        if (user.role === 'MANAGER') {
          const empRes = await axios.get('/api/auth/users', config);
          setUsers((empRes.data.users || []).filter(u => u.role !== 'MANAGER'));
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user.role]);

  const updateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`/api/auth/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await axios.get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers((empRes.data.users || []).filter(u => u.role !== 'MANAGER'));
    } catch (err) {
      console.error('Failed to update role', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-surface-container-highest text-on-surface-variant';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-800';
      case 'CLOSED': return 'bg-zinc-800 text-zinc-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full min-h-[calc(100vh-4rem)]">
        <div className="relative w-full bg-gradient-to-br from-primary-container/20 via-surface-container-low to-surface py-space-xl px-gutter overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg relative z-10">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container text-label-sm font-semibold uppercase tracking-wider">Operations Control</span>
                <span className="text-body-sm text-secondary">• System Active</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Welcome back, {user.name}</h1>
              <p className="text-body-lg text-on-surface-variant max-w-xl">
                {user.role} — Here is the overview of your ticketing system.
              </p>
            </div>
            
            <div className="flex items-center gap-space-md">
              {user.role === 'EMPLOYEE' && (
                <Link to="/new-ticket" className="inline-flex items-center gap-space-sm bg-primary text-on-primary px-space-lg py-3 rounded-lg font-label-md hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Create New Ticket
                </Link>
              )}
              <Link to="/tickets" className="inline-flex items-center gap-space-sm bg-surface-container-high text-on-surface px-space-lg py-3 rounded-lg font-label-md hover:bg-surface-container-highest transition-all">
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                View All Tickets
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-gutter py-space-xl flex flex-col gap-space-xl">
          
          {user.role === 'MANAGER' ? (
            <>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 mt-4">Status Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg mb-8">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Total Tickets</span>
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>assignment_ind</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">
                      {stats?.tickets || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-container"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Open / Active</span>
                    <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>folder_open</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">
                      {stats?.openTickets || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Resolved</span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>task_alt</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">
                      {stats?.resolvedTickets || 0}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Closed</span>
                    <div className="w-10 h-10 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-700 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>inventory</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">
                      {stats?.closedTickets || 0}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Priority Breakdown</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Critical</span>
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-800 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.criticalPriority || 0}</span>
                  </div>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">High</span>
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-800 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>priority_high</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.highPriority || 0}</span>
                  </div>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Medium</span>
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-800 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>remove</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.mediumPriority || 0}</span>
                  </div>
                </div>
                
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-label-md text-secondary font-medium">Low</span>
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-800 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>keyboard_arrow_down</span>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-headline-lg font-headline-lg text-on-surface">{stats?.lowPriority || 0}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-8">
                <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Employee Management</h2>
                  <h3 className="text-label-lg font-medium text-on-surface mb-4">Promote to Technical</h3>
                  {users.filter(u => u.role === 'EMPLOYEE').length === 0 ? (
                    <p className="text-body-md text-on-surface-variant">No standard employees found.</p>
                  ) : (
                    <div className="flex flex-col gap-space-sm">
                      {users.filter(u => u.role === 'EMPLOYEE').map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-surface-container">
                          <div className="flex flex-col truncate pr-4">
                            <span className="text-label-md font-medium text-on-surface truncate">{u.name}</span>
                            <span className="text-body-sm text-on-surface-variant truncate">{u.email}</span>
                          </div>
                          <button 
                            onClick={() => updateRole(u.id, 'TECHNICAL')}
                            className="shrink-0 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors text-label-sm px-3 py-1.5 rounded-md font-medium flex items-center gap-1"
                            title="Make Technical"
                          >
                            <span className="material-symbols-outlined text-[16px]">upgrade</span>
                            Promote
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Technical Management</h2>
                  <h3 className="text-label-lg font-medium text-on-surface mb-4">Demote Technicals</h3>
                  {users.filter(u => u.role === 'TECHNICAL').length === 0 ? (
                    <p className="text-body-md text-on-surface-variant">No technical users found.</p>
                  ) : (
                    <div className="flex flex-col gap-space-sm">
                      {users.filter(u => u.role === 'TECHNICAL').map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low border border-surface-container">
                          <div className="flex flex-col truncate pr-4">
                            <span className="text-label-md font-medium text-on-surface truncate">{u.name}</span>
                            <span className="text-body-sm text-on-surface-variant truncate">{u.email}</span>
                          </div>
                          <button 
                            onClick={() => updateRole(u.id, 'EMPLOYEE')}
                            className="shrink-0 bg-surface-container-high text-on-surface hover:bg-error hover:text-on-error transition-colors text-label-sm px-3 py-1.5 rounded-md font-medium flex items-center gap-1"
                            title="Make Employee"
                          >
                            <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_down</span>
                            Demote
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-space-lg max-w-4xl">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex items-center justify-between">
                  <span className="text-label-md text-secondary font-medium">My Tickets</span>
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>assignment_ind</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-headline-lg font-headline-lg text-on-surface">
                    {stats?.myTickets || 0}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-space-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-container"></div>
                <div className="flex items-center justify-between">
                  <span className="text-label-md text-secondary font-medium">
                    {user.role === 'EMPLOYEE' ? 'Tickets Awaiting Action' : 'My Open Tickets'}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]" style={{fontVariationSettings: "'FILL' 1"}}>
                      {user.role === 'EMPLOYEE' ? 'task_alt' : 'folder_open'}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-headline-lg font-headline-lg text-on-surface">
                    {stats?.myOpenTickets || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Recent Tickets</h2>
                <p className="text-body-sm text-secondary">Showing latest enterprise support requests across all departments.</p>
              </div>
              <div className="flex items-center gap-space-sm">
                <Link to="/tickets" className="text-primary hover:underline text-label-md font-medium px-space-sm py-2">View All</Link>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-label-sm uppercase tracking-wider">
                    <th className="py-3 px-space-lg font-semibold">Ticket ID</th>
                    <th className="py-3 px-space-lg font-semibold">Title</th>
                    <th className="py-3 px-space-lg font-semibold">Category</th>
                    <th className="py-3 px-space-lg font-semibold">Priority</th>
                    <th className="py-3 px-space-lg font-semibold">Status</th>
                    <th className="py-3 px-space-lg font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="text-body-md text-on-surface">
                  {loading ? (
                    <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
                  ) : recentTickets.length === 0 ? (
                    <tr><td colSpan="6" className="py-4 text-center">No recent tickets</td></tr>
                  ) : (
                    recentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-space-lg font-medium text-primary">
                          <Link to={`/tickets/${ticket.id}`}>{ticket.ticketNumber || ticket.id}</Link>
                        </td>
                        <td className="py-4 px-space-lg">
                          <div className="font-medium text-on-surface">{ticket.title}</div>
                          <div className="text-body-sm text-secondary truncate max-w-xs">{ticket.description}</div>
                        </td>
                        <td className="py-4 px-space-lg">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-label-sm font-medium bg-primary-fixed/40 text-on-primary-fixed">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="py-4 px-space-lg">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-space-lg">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-4 px-space-lg text-secondary text-body-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
