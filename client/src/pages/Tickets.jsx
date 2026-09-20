import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Link, useLocation } from 'react-router-dom';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('search');
    if (q !== null) {
      setSearch(q);
    }
  }, [location.search]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);
      if (technicianFilter) params.append('technicianId', technicianFilter);

      const response = await axios.get(`/api/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const results = response.data.result || response.data.empResult || response.data.techResult || [];
      setTickets(results);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, search, technicianFilter]);

  useEffect(() => {
    if (user.role === 'MANAGER') {
      const fetchTechnicians = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await axios.get('/api/auth/users?role=TECHNICAL', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTechnicians(res.data.users || []);
        } catch (err) {
          console.error('Failed to fetch technicians', err);
        }
      };
      fetchTechnicians();
    }
  }, [user.role]);

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
      <div className="flex flex-col w-full max-w-7xl mx-auto px-gutter py-space-xl">
        {/* Top Section: Header & Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg mb-space-xl">
          <div>
            <div className="flex items-center gap-space-xs text-secondary text-label-md mb-space-xs uppercase tracking-wider">
              <span>Helpdesk Operations</span>
              <span>/</span>
              <span className="text-on-surface font-medium">Ticket Queue</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Support Tickets</h1>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-sm bg-surface-container-low px-4 py-2 rounded-xl">
              <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
              <span className="text-body-md text-on-surface font-medium">Showing {tickets.length} Active Tickets</span>
            </div>
            <Link className="inline-flex items-center gap-space-sm bg-primary hover:bg-primary/90 text-on-primary px-space-lg py-3 rounded-lg font-medium transition-all shadow-sm" to="/new-ticket">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Ticket</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar Card */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] mb-space-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input 
                className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                placeholder="Search tickets by title..." 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Status Dropdown */}
            <div>
              <select 
                className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            
            {/* Priority Dropdown */}
            <div>
              <select 
                className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            {/* Category Dropdown */}
            <div>
              <select 
                className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="FACILITIES">Facilities</option>
                <option value="HR">HR</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Technician Dropdown (Manager Only) */}
            {user.role === 'MANAGER' && (
              <div>
                <select 
                  className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                  value={technicianFilter}
                  onChange={(e) => setTechnicianFilter(e.target.value)}
                >
                  <option value="">All Technicians</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Table Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] overflow-hidden mb-space-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-label-md">
                  <th className="p-4 pl-6 font-medium">
                    <input className="rounded text-primary focus:ring-primary" type="checkbox"/>
                  </th>
                  <th className="p-4 font-medium">Ticket ID</th>
                  <th className="p-4 font-medium min-w-[280px]">Title</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Priority</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 pr-6 font-medium">Created Date</th>
                </tr>
              </thead>
              <tbody className="text-body-md text-on-surface">
                {loading ? (
                  <tr><td colSpan="7" className="p-4 text-center">Loading tickets...</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan="7" className="p-4 text-center">No tickets found</td></tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <input className="rounded text-primary focus:ring-primary" type="checkbox"/>
                      </td>
                      <td className="p-4 font-mono font-medium text-primary">
                        <Link to={`/tickets/${ticket.id}`}>{ticket.ticketNumber || ticket.id}</Link>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-on-surface group-hover:text-primary transition-colors cursor-pointer">
                          <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
                        </div>
                        <div className="text-body-sm text-secondary truncate max-w-xs">{ticket.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-medium bg-primary-fixed text-on-primary-fixed">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-label-sm font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-secondary text-body-sm">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
