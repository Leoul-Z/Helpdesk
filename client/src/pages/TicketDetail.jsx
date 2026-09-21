import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTicketDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`/api/tickets/${id}`, config);
      setTicket(response.data.result);
      setActivities(response.data.activity || []);
    } catch (err) {
      console.error('Failed to fetch ticket details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
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
  }, [id, user.role]);

  const handlePostComment = async () => {
    if (!comment) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/tickets/${id}/comments`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComment('');
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const updateStatus = async (status) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`/api/tickets/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const confirmResolution = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`/api/tickets/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to confirm resolution', err);
    }
  };

  const assignTechnician = async () => {
    if (!selectedTechnician) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.patch(`/api/tickets/${id}/assign`, { TechnicalId: selectedTechnician }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTicketDetails();
    } catch (err) {
      console.error('Failed to assign ticket', err);
    }
  };

  if (loading) {
    return <Layout><div className="p-8 text-center">Loading ticket details...</div></Layout>;
  }

  if (!ticket) {
    return <Layout><div className="p-8 text-center text-error">Ticket not found</div></Layout>;
  }

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
        <div className="flex flex-col gap-space-md mb-space-xl">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="text-label-md font-label-md bg-primary-container text-on-primary-container px-3 py-1 rounded-full">{ticket.ticketNumber || ticket.id}</span>
              <span className="text-label-md font-label-md bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">{ticket.category}</span>
            </div>
            <div className="flex items-center gap-space-sm">
              <Link to="/tickets" className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-on-surface bg-surface-container-low px-3 py-1.5 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to list
              </Link>
            </div>
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">{ticket.title}</h1>
          
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <p className="text-body-lg font-body-lg text-on-surface-variant leading-relaxed">
              {ticket.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-body-sm text-outline">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Created: {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Activity Timeline</h2>
              </div>
              
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                {activities.length === 0 ? (
                  <div className="text-body-md text-outline">No activity found.</div>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="relative flex items-start gap-4">
                      <div className="absolute -left-6 w-4 h-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface-container-lowest">
                        <span className="w-2 h-2 rounded-full bg-on-primary"></span>
                      </div>
                      <div className="flex-1 bg-surface-container-low p-space-md rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-label-md font-label-md text-on-surface">
                            {activity.type === 'COMMENT' && 'New Comment'}
                            {activity.type === 'STATUS_CHANGE' && `Status changed from ${activity.fromStatus} to ${activity.toStatus}`}
                            {activity.type === 'ASSIGNMENT' && 'Ticket Assigned'}
                          </span>
                          <span className="text-body-sm text-outline">{new Date(activity.createdAt).toLocaleString()}</span>
                        </div>
                        {activity.type === 'COMMENT' && (
                          <div className="text-body-md text-on-surface-variant mt-2">{activity.content}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-space-md pt-space-md border-t border-surface-container-high flex flex-col gap-space-sm">
                <label className="text-label-md font-label-md text-on-surface flex items-center justify-between" htmlFor="comment-box">
                  <span>Leave a comment</span>
                </label>
                <textarea 
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y" 
                  id="comment-box" 
                  placeholder="Type your comment or update here..." 
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <div className="flex items-center justify-end mt-1">
                  <button 
                    onClick={handlePostComment}
                    className="bg-primary hover:bg-primary/90 text-on-primary text-label-md font-label-md px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span> Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <h3 className="text-label-md font-label-md text-outline uppercase tracking-wider">Actions</h3>
              <div className="flex flex-col gap-space-sm">
                
                {user.role === 'MANAGER' && (
                  <>
                    {ticket.status === 'OPEN' && (
                      <div className="flex flex-col gap-2 mb-2">
                        <select
                          className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                          value={selectedTechnician}
                          onChange={(e) => setSelectedTechnician(e.target.value)}
                        >
                          <option value="">Select Technician...</option>
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                          ))}
                        </select>
                        <button onClick={assignTechnician} disabled={!selectedTechnician} className="w-full bg-primary text-on-primary hover:bg-primary/90 text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                          <span className="material-symbols-outlined text-[18px]">person_check</span> Assign Technician
                        </button>
                      </div>
                    )}
                    {ticket.status !== 'CLOSED' && ticket.status !== 'OPEN' && (
                       <>
                         <button onClick={() => updateStatus('IN_PROGRESS')} className="w-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                           <span className="material-symbols-outlined text-[18px]">sync</span> Mark In Progress
                         </button>
                         <button onClick={() => updateStatus('RESOLVED')} className="w-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                           <span className="material-symbols-outlined text-[18px]">check_circle</span> Resolve Ticket
                         </button>
                       </>
                    )}
                  </>
                )}
                
                {user.role === 'TECHNICAL' && (
                  <>
                    {ticket.status === 'ASSIGNED' && (
                      <button onClick={() => updateStatus('IN_PROGRESS')} className="w-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">sync</span> Start Progress
                      </button>
                    )}
                    {ticket.status === 'IN_PROGRESS' && (
                      <button onClick={() => updateStatus('RESOLVED')} className="w-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span> Mark Resolved
                      </button>
                    )}
                  </>
                )}
                
                {user.role === 'EMPLOYEE' && ticket.status === 'RESOLVED' && (
                  <button onClick={confirmResolution} className="w-full text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-label-md font-label-md py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span> Confirm & Close
                  </button>
                )}

              </div>
            </div>
            
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-lg">
              <h3 className="text-label-md font-label-md text-outline uppercase tracking-wider">Ticket Details</h3>
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between py-2 border-b border-surface-container-low">
                  <span className="text-body-md text-on-surface-variant">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-surface-container-low">
                  <span className="text-body-md text-on-surface-variant">Priority</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-md font-label-md ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-surface-container-low">
                  <span className="text-body-md text-on-surface-variant">Category</span>
                  <span className="text-body-md font-medium text-on-surface">{ticket.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
