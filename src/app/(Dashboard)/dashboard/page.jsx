"use client";

import React from 'react';

export default function GeneralDashboard() {
  return (
    <div style={{ color: 'var(--cream)' }}>
      <div className="page-header">
        <div>
          <h1>Welcome to Your Skin Health Command Center</h1>
          <p>Real-time telemetry and architectural skin insights overview.</p>
        </div>
      </div>
      
      <div className="analysis-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-title">Quick Action Pipeline</div>
          <p style={{ opacity: 0.7, marginBottom: '15px' }}>Ready to check your progress updates?</p>
          <a href="/facial-analysis" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
            Run Advanced Facial Analysis
          </a>
        </div>
        
        <div className="card">
          <div className="card-title">System Status Diagnostics</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div>Neural Mesh Link: <span style={{ color: 'var(--emerald, #10B981)' }}>Online</span></div>
            <div>Database Sync Pipeline: <span style={{ color: 'var(--emerald, #10B981)' }}>Synced</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
