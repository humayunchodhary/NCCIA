import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProgressBar from '../components/ProgressBar';

export default function DepartmentProgress() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [circleId, setCircleId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [pieMode, setPieMode] = useState('stages'); // 'stages' | 'categories'
  const [hoveredSlice, setHoveredSlice] = useState(null);

  const fetchMonitoringData = (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    } else {
      setRefreshing(true);
    }

    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (circleId) params.set('circle_id', circleId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    api.get(`/department-progress?${params.toString()}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        if (!silent) {
          setError(err.response?.data?.message || err.message || 'Failed to load monitoring dashboard');
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchMonitoringData();
  }, [year, circleId]);

  const handleApplyCustomDates = (e) => {
    e.preventDefault();
    fetchMonitoringData();
  };

  const handleResetFilters = () => {
    setYear(currentYear);
    setCircleId('');
    setDateFrom('');
    setDateTo('');
  };

  // Pie Chart calculations for Donut
  const activePieData = useMemo(() => {
    if (!data) return [];
    if (pieMode === 'categories') {
      return (data.category_breakdown || []).map(c => ({
        name: c.name,
        count: Number(c.count) || 0,
        color: c.color || '#2563eb',
      }));
    }
    return (data.workflow_pie || []).map(s => ({
      name: s.name,
      count: Number(s.count) || 0,
      color: s.color || '#0284c7',
    }));
  }, [data, pieMode]);

  const pieTotal = useMemo(() => {
    return activePieData.reduce((acc, curr) => acc + curr.count, 0);
  }, [activePieData]);

  // Generate SVG Donut paths
  const donutSlices = useMemo(() => {
    if (!pieTotal || activePieData.length === 0) return [];
    let cumulativeAngle = 0;
    const cx = 150;
    const cy = 150;
    const outerR = 120;
    const innerR = 75;

    return activePieData.map((slice, index) => {
      const sliceAngle = (slice.count / pieTotal) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      // Convert polar to cartesian
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = cx + outerR * Math.cos(startRad);
      const y1 = cy + outerR * Math.sin(startRad);
      const x2 = cx + outerR * Math.cos(endRad);
      const y2 = cy + outerR * Math.sin(endRad);

      const x3 = cx + innerR * Math.cos(endRad);
      const y3 = cy + innerR * Math.sin(endRad);
      const x4 = cx + innerR * Math.cos(startRad);
      const y4 = cy + innerR * Math.sin(startRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      const percentage = Math.round((slice.count / pieTotal) * 100);

      return {
        ...slice,
        index,
        percentage,
        pathData,
      };
    });
  }, [activePieData, pieTotal]);

  // Bar Chart calculations
  const barChartData = useMemo(() => {
    if (!data?.circle_bar_chart) return [];
    return data.circle_bar_chart;
  }, [data]);

  const maxBarValue = useMemo(() => {
    if (!barChartData.length) return 10;
    return Math.max(...barChartData.map(b => b.total), 1);
  }, [barChartData]);

  // Monthly trends calculations
  const monthlyTrends = data?.monthly_trends || [];
  const maxMonthlyVal = useMemo(() => {
    if (!monthlyTrends.length) return 10;
    const maxRec = Math.max(...monthlyTrends.map(m => m.received), 0);
    const maxRes = Math.max(...monthlyTrends.map(m => m.resolved), 0);
    return Math.max(maxRec, maxRes, 5);
  }, [monthlyTrends]);

  // Filtered Circle Table
  const filteredCircles = useMemo(() => {
    if (!data?.circle_breakdown) return [];
    if (!tableSearch.trim()) return data.circle_breakdown;
    const q = tableSearch.toLowerCase();
    return data.circle_breakdown.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  }, [data, tableSearch]);

  if (loading) {
    return (
      <div className="page-content">
        <LoadingSkeleton type="stats" rows={6} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          <LoadingSkeleton type="chart" />
          <LoadingSkeleton type="chart" />
        </div>
        <div style={{ marginTop: 24 }}>
          <LoadingSkeleton type="table" rows={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div style={{
          padding: 40, textAlign: 'center', background: '#fff',
          borderRadius: 12, border: '1px solid #fee2e2', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#b91c1c', marginBottom: 8, fontSize: 18, fontWeight: 700 }}>
            Access Restricted or Dashboard Unavailable
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, maxWidth: 500, margin: '0 auto 20px' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => fetchMonitoringData()}
            style={{
              padding: '8px 18px', background: '#015C94', color: '#fff',
              border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { metrics = {}, circles = [], legal_backlog = [] } = data || {};

  return (
    <div className="page-content" style={{ paddingBottom: 60 }}>
      {/* Top Banner & Header */}
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: '#015C94', color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '3px 9px', borderRadius: 12, letterSpacing: '0.05em', textTransform: 'uppercase'
            }}>
              Executive & Legal Oversight
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              • High-Level Agency Monitoring
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            Department Progress & Monitoring Dashboard
          </h1>
          <p className="page-subtitle" style={{ fontSize: 13, color: '#475569' }}>
            Consolidated disposal metrics, circle comparative analytics & legal scrutiny pipeline across NCCIA.
          </p>
          <div className="title-underline" style={{ width: 80, height: 3, background: '#015C94', marginTop: 8 }}></div>
        </div>

        {/* Global Filter Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
          background: '#fff', padding: '8px 14px', borderRadius: 10,
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* Year Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Year:</span>
            <select
              className="filter-select"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{ padding: '5px 10px', fontSize: 13, minWidth: 90 }}
            >
              {[...Array(5)].map((_, i) => currentYear - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Circle Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Circle:</span>
            <select
              className="filter-select"
              value={circleId}
              onChange={e => setCircleId(e.target.value)}
              style={{ padding: '5px 10px', fontSize: 13, minWidth: 150 }}
            >
              <option value="">All Circles / Agency Wide</option>
              {circles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.code ? `(${c.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Form */}
          <form onSubmit={handleApplyCustomDates} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="date"
              className="filter-input"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="From"
              style={{ padding: '4px 8px', fontSize: 12 }}
              title="Filter from date"
            />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>–</span>
            <input
              type="date"
              className="filter-input"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="To"
              style={{ padding: '4px 8px', fontSize: 12 }}
              title="Filter to date"
            />
            {(dateFrom || dateTo) && (
              <button
                type="submit"
                style={{
                  padding: '5px 10px', background: '#015C94', color: '#fff',
                  border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Filter
              </button>
            )}
          </form>

          {(circleId || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'transparent', border: 'none', color: '#ef4444',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '4px 6px'
              }}
            >
              Clear
            </button>
          )}

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchMonitoringData(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6,
              fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer'
            }}
            title="Refresh Data"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              style={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="stats-grid" style={{ marginTop: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Total Workload */}
        <div className="stat-card blue" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="stat-value" style={{ fontSize: 26, fontWeight: 800 }}>
            {metrics.total_workload?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Total Workload</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            {metrics.total_complaints || 0} CMU + {metrics.total_enquiries || 0} Enq + {metrics.registered_cases || 0} Cases
          </div>
        </div>

        {/* Overall Disposal Rate */}
        <div className="stat-card green">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>
              {metrics.overall_disposal_rate || 0}%
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              background: metrics.overall_disposal_rate >= 70 ? '#dcfce7' : '#fef3c7',
              color: metrics.overall_disposal_rate >= 70 ? '#15803d' : '#b45309'
            }}>
              {metrics.overall_disposal_rate >= 70 ? 'Optimal' : 'In Progress'}
            </span>
          </div>
          <div className="stat-label">Overall Disposal Rate</div>
          <div style={{ marginTop: 6 }}>
            <ProgressBar value={metrics.overall_disposal_rate || 0} color="#16a34a" />
          </div>
        </div>

        {/* Active Enquiries */}
        <div className="stat-card orange">
          <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#ea580c' }}>
            {metrics.active_enquiries?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Active Enquiries</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Out of {metrics.total_enquiries || 0} registered
          </div>
        </div>

        {/* Finalized Cases / Convictions */}
        <div className="stat-card teal">
          <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#0d9488' }}>
            {metrics.finalized_cases?.toLocaleString() || 0}
          </div>
          <div className="stat-label">Finalized Cases / Disposals</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Active FIR Cases: {Math.max(0, (metrics.registered_cases || 0) - (metrics.finalized_cases || 0))}
          </div>
        </div>

        {/* Pending Legal Review Backlog (Key for AD Legal, DD Legal, AD, DG) */}
        <div className="stat-card gold" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#d97706' }}>
              {metrics.pending_legal_reviews || 0}
            </div>
            <span style={{
              background: '#fef3c7', color: '#b45309', fontSize: 10, fontWeight: 700,
              padding: '2px 6px', borderRadius: 8
            }}>
              Action Req.
            </span>
          </div>
          <div className="stat-label">Pending Legal Scrutiny</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            CFRs & opinions awaiting AD/DD/DG
          </div>
        </div>

        {/* Court Hearings / Active Trials */}
        <div className="stat-card purple">
          <div className="stat-value" style={{ fontSize: 26, fontWeight: 800, color: '#7c3aed' }}>
            {metrics.total_court_cases || 0}
          </div>
          <div className="stat-label">Court Case Registry</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Under trial across circles
          </div>
        </div>
      </div>

      {/* Charts Section Row 1: Donut/Pie Chart & Monthly Inflow/Disposal Chart */}
      <div className="dashboard-grid" style={{ marginTop: 24, gridTemplateColumns: '1.1fr 1.4fr', gap: 20 }}>
        {/* Chart 1: Interactive SVG Pie / Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Distribution Breakdown</span>
            </div>
            {/* Toggle Pie Mode */}
            <div style={{
              display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2
            }}>
              <button
                type="button"
                onClick={() => setPieMode('stages')}
                style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, border: 'none', borderRadius: 4,
                  cursor: 'pointer',
                  background: pieMode === 'stages' ? '#fff' : 'transparent',
                  color: pieMode === 'stages' ? '#015C94' : '#64748b',
                  boxShadow: pieMode === 'stages' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                By Stage
              </button>
              <button
                type="button"
                onClick={() => setPieMode('categories')}
                style={{
                  padding: '4px 10px', fontSize: 11, fontWeight: 700, border: 'none', borderRadius: 4,
                  cursor: 'pointer',
                  background: pieMode === 'categories' ? '#fff' : 'transparent',
                  color: pieMode === 'categories' ? '#015C94' : '#64748b',
                  boxShadow: pieMode === 'categories' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                By Crime Type
              </button>
            </div>
          </div>

          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            {pieTotal > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap', width: '100%' }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: 220, height: 220, flexShrink: 0 }}>
                  <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {donutSlices.map(slice => {
                      const isHovered = hoveredSlice?.name === slice.name;
                      return (
                        <path
                          key={slice.name}
                          d={slice.pathData}
                          fill={slice.color}
                          style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s, opacity 0.2s',
                            transformOrigin: '150px 150px',
                            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                            opacity: hoveredSlice && !isHovered ? 0.6 : 1,
                            filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none',
                          }}
                          onMouseEnter={() => setHoveredSlice(slice)}
                          onMouseLeave={() => setHoveredSlice(null)}
                        />
                      );
                    })}
                  </svg>
                  {/* Center Text inside Donut */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                      {hoveredSlice ? hoveredSlice.count.toLocaleString() : pieTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {hoveredSlice ? hoveredSlice.name : 'Total Volume'}
                    </div>
                    {hoveredSlice && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: hoveredSlice.color, marginTop: 2 }}>
                        {hoveredSlice.percentage}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {donutSlices.map(slice => {
                    const isHovered = hoveredSlice?.name === slice.name;
                    return (
                      <div
                        key={slice.name}
                        onMouseEnter={() => setHoveredSlice(slice)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                          background: isHovered ? '#f8fafc' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: slice.color, flexShrink: 0 }}></span>
                          <span style={{ fontSize: 12.5, color: isHovered ? '#0f172a' : '#334155', fontWeight: isHovered ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {slice.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                            {slice.count.toLocaleString()}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8', width: 32, textAlign: 'right' }}>
                            {slice.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ padding: 40, color: '#94a3b8', fontSize: 13 }}>
                No distribution data for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Monthly Trends (Inflow vs Disposal) */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="card-title">
              <span>Agency Inflow vs Disposal Trend ({year})</span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#2563eb', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#2563eb' }}></span> Received
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16a34a', fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a' }}></span> Disposed
              </span>
            </div>
          </div>

          <div className="card-body" style={{ height: 280, padding: '16px 20px' }}>
            <svg viewBox="0 0 600 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="trendRecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="trendResGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1={30} y1={200 - ratio * 170}
                  x2={580} y2={200 - ratio * 170}
                  stroke="#f1f5f9" strokeWidth="1"
                />
              ))}

              {/* Polylines and Area Gradients */}
              {monthlyTrends.length > 0 && (
                <>
                  {/* Received Area */}
                  <polygon
                    fill="url(#trendRecGrad)"
                    points={`30,200 ${monthlyTrends.map((m, i) => `${i * 48 + 40},${200 - (m.received / maxMonthlyVal) * 170}`).join(' ')} ${11 * 48 + 40},200`}
                  />
                  {/* Resolved Area */}
                  <polygon
                    fill="url(#trendResGrad)"
                    points={`30,200 ${monthlyTrends.map((m, i) => `${i * 48 + 40},${200 - (m.resolved / maxMonthlyVal) * 170}`).join(' ')} ${11 * 48 + 40},200`}
                  />

                  {/* Lines */}
                  <polyline
                    fill="none" stroke="#2563eb" strokeWidth="2.5"
                    points={monthlyTrends.map((m, i) => `${i * 48 + 40},${200 - (m.received / maxMonthlyVal) * 170}`).join(' ')}
                  />
                  <polyline
                    fill="none" stroke="#16a34a" strokeWidth="2.5"
                    points={monthlyTrends.map((m, i) => `${i * 48 + 40},${200 - (m.resolved / maxMonthlyVal) * 170}`).join(' ')}
                  />

                  {/* Dots & Labels */}
                  {monthlyTrends.map((m, i) => {
                    const cx = i * 48 + 40;
                    const cyRec = 200 - (m.received / maxMonthlyVal) * 170;
                    const cyRes = 200 - (m.resolved / maxMonthlyVal) * 170;
                    return (
                      <g key={m.month}>
                        <circle cx={cx} cy={cyRec} r={3.5} fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
                        <circle cx={cx} cy={cyRes} r={3.5} fill="#16a34a" stroke="#fff" strokeWidth="1.5" />
                        <text x={cx} y={222} textAnchor="middle" fontSize="10.5" fill="#64748b" fontWeight="600">
                          {m.month}
                        </text>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Section Row 2: Circle Comparative Bar Chart */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">
            <span>Circle-by-Circle Comparative Performance (Top Circles by Volume)</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0284c7', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#0284c7' }}></span> Disposed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f97316', fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f97316' }}></span> Active / Pending
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: '20px 24px' }}>
          {barChartData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {barChartData.map((circle) => {
                const disposedPercent = circle.total > 0 ? Math.round((circle.disposed / circle.total) * 100) : 0;
                const pendingPercent = 100 - disposedPercent;
                const widthPercent = Math.max(5, (circle.total / maxBarValue) * 100);

                return (
                  <div key={circle.name} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px', alignItems: 'center', gap: 16 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {circle.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {circle.code ? `Code: ${circle.code}` : ''}
                      </div>
                    </div>

                    {/* Stacked Bar Container */}
                    <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 8, height: 24, overflow: 'hidden', display: 'flex', position: 'relative' }}>
                      <div style={{ width: `${widthPercent}%`, height: '100%', display: 'flex', borderRadius: 8, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${disposedPercent}%`,
                            background: '#0284c7',
                            height: '100%',
                            transition: 'width 0.4s ease'
                          }}
                          title={`Disposed: ${circle.disposed}`}
                        />
                        <div
                          style={{
                            width: `${pendingPercent}%`,
                            background: '#f97316',
                            height: '100%',
                            transition: 'width 0.4s ease'
                          }}
                          title={`Pending: ${circle.pending}`}
                        />
                      </div>
                    </div>

                    {/* Total & Rate */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {circle.total} cases
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: circle.rate >= 70 ? '#15803d' : (circle.rate >= 40 ? '#b45309' : '#dc2626')
                      }}>
                        {circle.rate}% Disposed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>
              No circle performance data available for this filter.
            </div>
          )}
        </div>
      </div>

      {/* Circle Detailed Progress Table */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title">Comprehensive Department & Circle Progress</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Individual performance metrics, legal bottlenecks & disposal ratios
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              placeholder="Search circle name or code..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              className="filter-input"
              style={{ width: 220, fontSize: 12.5 }}
            />
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Circle / Department</th>
                  <th>Complaints (CMU)</th>
                  <th>Enquiries</th>
                  <th>FIR Cases</th>
                  <th>Legal Pending</th>
                  <th style={{ width: 200 }}>Disposal Progress</th>
                  <th style={{ textAlign: 'center' }}>Health Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCircles.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      {c.code && <span className="table-id" style={{ marginTop: 2 }}>{c.code}</span>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.total_complaints}</div>
                      <div style={{ fontSize: 11, color: '#16a34a' }}>{c.resolved_complaints} resolved</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.total_enquiries}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.total_cases}</div>
                      <div style={{ fontSize: 11, color: '#0d9488' }}>{c.finalized_cases} finalized</div>
                    </td>
                    <td>
                      {c.pending_legal > 0 ? (
                        <span style={{
                          background: '#fef3c7', color: '#b45309', padding: '3px 8px',
                          borderRadius: 6, fontSize: 11, fontWeight: 700
                        }}>
                          {c.pending_legal} pending
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>0</span>
                      )}
                    </td>
                    <td>
                      <ProgressBar value={c.disposal_rate} showLabel />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: c.status_badge === 'high' ? '#dcfce7' : (c.status_badge === 'medium' ? '#fef3c7' : '#fee2e2'),
                        color: c.status_badge === 'high' ? '#15803d' : (c.status_badge === 'medium' ? '#b45309' : '#b91c1c')
                      }}>
                        {c.status_badge === 'high' ? 'High' : (c.status_badge === 'medium' ? 'Moderate' : 'Critical')}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filteredCircles.length && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#94a3b8' }}>
                      No circles found matching "{tableSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Legal Scrutiny & Approval Backlog (Dedicated for Legal Chain + DG) */}
      <div className="card" style={{ marginTop: 24, borderTop: '3px solid #f59e0b' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚖️ Legal Scrutiny & Approval Backlog</span>
              <span style={{
                background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700,
                padding: '2px 8px', borderRadius: 10
              }}>
                {legal_backlog.length} Awaiting Scrutiny
              </span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              CFRs and Enquiry/Case files currently queued for AD Legal, DD Legal, Additional Director, and DG opinions.
            </div>
          </div>
          <Link
            to="/enquiries"
            style={{
              fontSize: 12, fontWeight: 600, color: '#015C94', textDecoration: 'none'
            }}
          >
            View All Enquiries →
          </Link>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>Reference Number</th>
                  <th>Originating Circle</th>
                  <th>Current Approval Stage</th>
                  <th>Last Movement</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {legal_backlog.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span style={{
                        background: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 4
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.number}
                    </td>
                    <td style={{ color: '#334155' }}>
                      {item.circle}
                    </td>
                    <td>
                      <span style={{
                        background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase'
                      }}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b' }}>
                      {item.updated_at}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/enquiries/${item.id}/edit`}
                        style={{
                          padding: '4px 10px', background: '#015C94', color: '#fff',
                          borderRadius: 4, fontSize: 11, fontWeight: 600, textDecoration: 'none'
                        }}
                      >
                        Review Opinion
                      </Link>
                    </td>
                  </tr>
                ))}
                {!legal_backlog.length && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#16a34a', fontWeight: 600 }}>
                      ✓ No pending legal scrutiny backlogs at this moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
