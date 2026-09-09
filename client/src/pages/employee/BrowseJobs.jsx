import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiBriefcase, FiClock, FiCalendar, FiFileText, FiArrowLeft, FiChevronRight } from 'react-icons/fi';

import { API } from '../../config/api';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setJobs(res.data); setFiltered(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    let result = jobs;
    if (search) result = result.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.requiredSkills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
    if (deptFilter !== 'All') result = result.filter(j => j.department === deptFilter);
    setFiltered(result);
  }, [search, deptFilter, jobs]);

  const departments = ['All', ...new Set(jobs.map(j => j.department))];

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        .job-card:hover { border-color:rgba(99,179,237,0.3)!important; background:rgba(59,130,246,0.04)!important; transform:translateY(-2px); }
        .job-card { transition: all 0.18s; }
        .search-input { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 16px 12px 42px; font-size:14px; color:white; outline:none; width:100%; font-family:inherit; }
        .search-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.15); }
        .search-input::placeholder { color:rgba(255,255,255,0.3); }
        .dept-btn:hover { border-color:rgba(59,130,246,0.4)!important; color:white!important; }
        .dept-btn { transition: all 0.15s; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/dashboard')}>Vactrix</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/my-applications')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiFileText /> My Applications
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiArrowLeft /> Dashboard
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease both' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBriefcase /> Browse Open Jobs
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>{filtered.length} position{filtered.length !== 1 ? 's' : ''} available</p>
        </div>

        {/* Search + Filter */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease 0.08s both' }}>
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}>
              <FiSearch />
            </span>
            <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, departments, skills..." />
            {search && <span onClick={() => setSearch('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>×</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {departments.map(dept => (
              <button key={dept} className="dept-btn" onClick={() => setDeptFilter(dept)}
                style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${deptFilter === dept ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`, background: deptFilter === dept ? 'rgba(59,130,246,0.15)' : 'transparent', color: deptFilter === dept ? '#60a5fa' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><FiSearch /></div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No jobs found</div>
            <div style={{ fontSize: '14px' }}>Try a different search or filter</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filtered.map((job, i) => (
              <div key={job._id} className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '22px 24px', cursor: 'pointer', animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700' }}>{job.title}</h3>
                      <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac', padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>OPEN</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiBriefcase size={14} /> {job.department}</span>
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock size={14} /> {job.minExperience}+ years exp</span>
                      {job.deadline && <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCalendar size={14} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                    </div>
                    {job.requiredSkills?.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {job.requiredSkills.map(skill => (
                          <span key={skill} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ color: '#60a5fa', fontSize: '20px', lineHeight: 1 }}><FiChevronRight /></div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', fontWeight: '600' }}>View Details</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
