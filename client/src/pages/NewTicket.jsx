import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

export default function NewTicket() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT_SUPPORT');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post('/api/tickets', {
        title,
        description,
        priority,
        category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate(`/tickets/${response.data.ticket.id}`);
    } catch (err) {
      console.error('Failed to create ticket', err);
      setError(err.response?.data?.message || 'Failed to submit ticket');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-4xl mx-auto px-gutter py-space-xl">
        {/* Back Navigation & Header */}
        <div className="flex flex-col gap-space-sm mb-space-xl">
          <Link to="/dashboard" className="inline-flex items-center gap-space-xs text-secondary hover:text-on-surface transition-colors text-label-md w-fit">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-label-sm uppercase tracking-wider text-primary font-medium">DeskFlow Portal</span>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Submit New Support Ticket</h1>
            <p className="text-body-md text-on-surface-variant mt-space-xs">Provide detailed information regarding your IT or facilities issue to ensure rapid dispatch.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-xl relative overflow-hidden">
          {/* Decorative background ambient glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <form className="flex flex-col gap-space-lg relative z-10" onSubmit={handleSubmit}>
            {error && <div className="text-error font-medium">{error}</div>}
            
            {/* Ticket Title */}
            <div className="flex flex-col gap-space-xs">
              <label className="text-label-md font-medium text-on-surface flex items-center justify-between" htmlFor="ticket-title">
                <span>Ticket Title</span>
                <span className="text-label-sm text-outline font-normal">Required</span>
              </label>
              <input 
                className="bg-surface-container-low text-on-surface placeholder:text-outline text-body-md rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                id="ticket-title" 
                placeholder="e.g. Projector in Conference Room B not working" 
                required 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              {/* Category */}
              <div className="flex flex-col gap-space-xs">
                <label className="text-label-md font-medium text-on-surface" htmlFor="ticket-category">Category</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-all pr-10" 
                    id="ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="IT_SUPPORT">IT Support</option>
                    <option value="FACILITIES">Facilities</option>
                    <option value="HR">HR</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
              
              {/* Priority */}
              <div className="flex flex-col gap-space-xs">
                <label className="text-label-md font-medium text-on-surface" htmlFor="ticket-priority">Priority Level</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-low text-on-surface text-body-md rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-all pr-10" 
                    id="ticket-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="flex flex-col gap-space-xs">
              <label className="text-label-md font-medium text-on-surface" htmlFor="ticket-description">Description</label>
              <div className="bg-surface-container-low rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                <textarea 
                  className="w-full bg-transparent text-on-surface placeholder:text-outline text-body-md p-4 focus:outline-none resize-y" 
                  id="ticket-description" 
                  placeholder="Provide a detailed explanation of the issue, steps to reproduce, or specific hardware/software details..." 
                  rows="6"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-space-md pt-space-md">
              <button 
                className="px-6 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors text-label-md font-medium" 
                onClick={() => navigate(-1)} 
                type="button"
              >
                Cancel
              </button>
              <button 
                className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-lg shadow-sm hover:shadow transition-all text-label-md font-medium flex items-center gap-space-xs disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
