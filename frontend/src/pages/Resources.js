// src/pages/Resources.js
import React, { useState, useEffect } from 'react';
import {
  Search, Layers, FileText, Video, BookOpen,
  Download, Eye, ChevronDown, Youtube
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';

const API_BASE_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 5;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

/* ─── Category config ─────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',               label: 'All',              icon: Layers   },
  { id: 'past_paper',        label: 'Past Papers',      icon: FileText },
  { id: 'paper_discussion',  label: 'Discussion Videos',icon: Video    },
  { id: 'lecture_material',  label: 'Lectures',         icon: BookOpen },
];

const CATEGORY_STYLES = {
  past_paper:       { bg: '#fef3c7', color: '#92400e', label: 'Past Paper'  },
  paper_discussion: { bg: '#ede9fe', color: '#5b21b6', label: 'Discussion'  },
  lecture_material: { bg: '#d1fae5', color: '#065f46', label: 'Lecture'     },
  other:            { bg: '#f3f4f6', color: '#374151', label: 'Other'       },
};

/* ─── Handle open/download ────────────────────────────────── */
const openResource = async (res) => {
  try {
    await fetch(`${API_BASE_URL}/resources/resources/${res._id}/download`, {
      method: 'PUT', headers: authHeader()
    });
  } catch (_) {}
  const url = (res.fileUrl && res.fileUrl.startsWith('http'))
    ? res.fileUrl
    : `http://localhost:5000${res.fileUrl}`;
  window.open(url, '_blank');
};

/* ─── Resource card ───────────────────────────────────────── */
const ResourceCard = ({ res }) => {
  const isVideo = res.fileType === 'video' || res.category === 'paper_discussion';
  const cat     = CATEGORY_STYLES[res.category] || CATEGORY_STYLES.other;

  const FileIcon = isVideo ? Video : FileText;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', borderRadius: 10,
      background: '#fff', border: '1px solid #e5e7eb',
      marginBottom: 10, transition: 'box-shadow 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <FileIcon size={18} color={cat.color} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', lineHeight: 1.4 }}>
          {res.title}
        </div>
        {res.description && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {res.description}
          </div>
        )}
        <span style={{
          display: 'inline-block', marginTop: 4,
          fontSize: 11, fontWeight: 600, padding: '2px 8px',
          borderRadius: 20, background: cat.bg, color: cat.color
        }}>
          {cat.label}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {isVideo ? (
          <button onClick={() => openResource(res)} style={btnStyle('#1d4ed8')}>
            <Youtube size={13} /> YouTube
          </button>
        ) : (
          <button onClick={() => openResource(res)} style={btnStyle('#1d4ed8')}>
            <Download size={13} /> Download
          </button>
        )}
        <button onClick={() => openResource(res)} style={btnStyle('#fff', '#374151', '1px solid #d1d5db')}>
          <Eye size={13} /> View
        </button>
      </div>
    </div>
  );
};

const btnStyle = (bg, color = '#fff', border = 'none') => ({
  display: 'flex', alignItems: 'center', gap: 5,
  background: bg, color, border,
  borderRadius: 7, padding: '7px 14px',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
  whiteSpace: 'nowrap'
});

/* ─── Section wrapper ─────────────────────────────────────── */
const Section = ({ title, icon: Icon, children }) => (
  <div style={{
    background: '#f9fafb', border: '1px solid #e5e7eb',
    borderRadius: 14, padding: '20px 20px 14px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Icon size={20} color="#374151" />
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</h3>
    </div>
    {children}
  </div>
);

/* ─── Category pills ──────────────────────────────────────── */
const CategoryPills = ({ active, onChange }) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
    {CATEGORIES.map(cat => {
      const Icon = cat.icon;
      const isActive = active === cat.id;
      return (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20, fontSize: 13,
            fontWeight: isActive ? 600 : 400, cursor: 'pointer',
            border: isActive ? '1.5px solid #1d4ed8' : '1px solid #d1d5db',
            background: isActive ? '#eff6ff' : '#fff',
            color: isActive ? '#1d4ed8' : '#6b7280',
            transition: 'all 0.15s'
          }}
        >
          <Icon size={13} />
          {cat.label}
        </button>
      );
    })}
  </div>
);

/* ─── Load more ───────────────────────────────────────────── */
const LoadMore = ({ onClick }) => (
  <div style={{ textAlign: 'center', marginTop: 8 }}>
    <button onClick={onClick} style={{
      background: '#fff', border: '1px solid #d1d5db', borderRadius: 20,
      padding: '7px 20px', fontSize: 13, color: '#374151',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6
    }}>
      Load More <ChevronDown size={14} />
    </button>
  </div>
);

/* ════════════════ MAIN PAGE ══════════════════════════════════ */
const Resources = () => {
  /* ── Common Resources ── */
  const [commonAll,      setCommonAll]      = useState([]);
  const [commonLoading,  setCommonLoading]  = useState(true);
  const [commonSearch,   setCommonSearch]   = useState('');
  const [commonCategory, setCommonCategory] = useState('all');
  const [commonVisible,  setCommonVisible]  = useState(PAGE_SIZE);

  /* ── Subject Resources ── */
  const [courses,        setCourses]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjectAll,     setSubjectAll]     = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectSearch,  setSubjectSearch]  = useState('');
  const [subjectCategory,setSubjectCategory]= useState('all');
  const [subjectVisible, setSubjectVisible] = useState(PAGE_SIZE);

  /* ── Fetch common resources ── */
  useEffect(() => {
    (async () => {
      setCommonLoading(true);
      try {
        const res  = await fetch(`${API_BASE_URL}/resources/common`, { headers: authHeader() });
        const data = await res.json();
        if (data.success) setCommonAll(data.data);
      } catch (e) { console.error(e); }
      finally { setCommonLoading(false); }
    })();
  }, []);

  /* ── Fetch enrolled courses ── */
  useEffect(() => {
    (async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const studentId = userData._id;
        if (!studentId) return;
        const res  = await fetch(`${API_BASE_URL}/enrollments/students/${studentId}/courses`, { headers: authHeader() });
        const data = await res.json();
        if (data.success) {
          const cs = (data.data || []).filter(Boolean);
          setCourses(cs);
          if (cs.length > 0) setSelectedCourse(cs[0]._id);
        }
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* ── Fetch resources when course changes ── */
  useEffect(() => {
    if (!selectedCourse) return;
    (async () => {
      setSubjectLoading(true);
      setSubjectSearch('');
      setSubjectCategory('all');
      setSubjectVisible(PAGE_SIZE);
      try {
        const res  = await fetch(`${API_BASE_URL}/resources/courses/${selectedCourse}/resources`, { headers: authHeader() });
        const data = await res.json();
        setSubjectAll(data.success ? data.data : []);
      } catch (e) { console.error(e); setSubjectAll([]); }
      finally { setSubjectLoading(false); }
    })();
  }, [selectedCourse]);

  /* ── Client-side filter helper ── */
  const applyFilter = (list, search, category) =>
    list.filter(r => {
      const matchCat = category === 'all' || r.category === category;
      const q        = search.toLowerCase();
      const matchQ   = !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q);
      return matchCat && matchQ;
    });

  const filteredCommon  = applyFilter(commonAll,  commonSearch,  commonCategory);
  const filteredSubject = applyFilter(subjectAll, subjectSearch, subjectCategory);

  const selectedCourseName = courses.find(c => c._id === selectedCourse)?.title || '';

  /* ─────────────── RENDER ─────────────── */
  return (
    <StudentLayout title="Resources">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Layers size={22} color="#374151" />
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Resources</h2>
        </div>

        {/* ════ COMMON RESOURCES ════ */}
        <Section title="Common Resources" icon={BookOpen}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search resources…"
              value={commonSearch}
              onChange={e => { setCommonSearch(e.target.value); setCommonVisible(PAGE_SIZE); }}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 14px 9px 36px',
                border: '1px solid #d1d5db', borderRadius: 8,
                fontSize: 13, outline: 'none', background: '#fff',
                color: '#111827'
              }}
            />
          </div>

          {/* Category pills */}
          <CategoryPills active={commonCategory} onChange={v => { setCommonCategory(v); setCommonVisible(PAGE_SIZE); }} />

          {/* List */}
          {commonLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : filteredCommon.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 14 }}>
              {commonAll.length === 0 ? 'No resources uploaded yet.' : 'No resources match your search.'}
            </div>
          ) : (
            <>
              {filteredCommon.slice(0, commonVisible).map(r => <ResourceCard key={r._id} res={r} />)}
              {filteredCommon.length > commonVisible && (
                <LoadMore onClick={() => setCommonVisible(v => v + PAGE_SIZE)} />
              )}
            </>
          )}
        </Section>

        <div style={{ height: 24 }} />

        {/* ════ SUBJECT RESOURCES ════ */}
        <Section title="Subject Resources" icon={Layers}>
          {/* Course selector */}
          {courses.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 14 }}>
              You are not enrolled in any courses yet.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>Subject:</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {courses.map(c => (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCourse(c._id)}
                    style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 13,
                      fontWeight: selectedCourse === c._id ? 600 : 400,
                      cursor: 'pointer',
                      border: selectedCourse === c._id ? '1.5px solid #1d4ed8' : '1px solid #d1d5db',
                      background: selectedCourse === c._id ? '#eff6ff' : '#fff',
                      color: selectedCourse === c._id ? '#1d4ed8' : '#6b7280',
                    }}
                  >
                    {c.title || c.subject}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          {courses.length > 0 && (
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Search size={15} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={`Search in ${selectedCourseName}…`}
                value={subjectSearch}
                onChange={e => { setSubjectSearch(e.target.value); setSubjectVisible(PAGE_SIZE); }}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 14px 9px 36px',
                  border: '1px solid #d1d5db', borderRadius: 8,
                  fontSize: 13, outline: 'none', background: '#fff',
                  color: '#111827'
                }}
              />
            </div>
          )}

          {/* Category pills */}
          {courses.length > 0 && (
            <CategoryPills active={subjectCategory} onChange={v => { setSubjectCategory(v); setSubjectVisible(PAGE_SIZE); }} />
          )}

          {/* List */}
          {subjectLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : filteredSubject.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 14 }}>
              {subjectAll.length === 0
                ? courses.length === 0 ? '' : 'No resources uploaded for this subject yet.'
                : 'No resources match your search.'}
            </div>
          ) : (
            <>
              {filteredSubject.slice(0, subjectVisible).map(r => <ResourceCard key={r._id} res={r} />)}
              {filteredSubject.length > subjectVisible && (
                <LoadMore onClick={() => setSubjectVisible(v => v + PAGE_SIZE)} />
              )}
            </>
          )}
        </Section>

      </div>
    </StudentLayout>
  );
};

export default Resources;
