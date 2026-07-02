"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/useUserStore';
import { useShallow } from 'zustand/react/shallow';

// ─── Theme ────────────────────────────────────────────────────
const T = {
  navy:    '#0A0A1A',
  navyMid: '#0f0c0e',
  navyEl:  '#140f12',
  offWhite:'#F5F0EB',
  rose:    '#FF3E7F',
  violet:  '#7B5EA7',
  amber:   '#E8A838',
  border:  'rgba(245,240,235,0.07)',
  muted:   'rgba(245,240,235,0.4)',
  faint:   'rgba(245,240,235,0.15)',
};

// ─── Icons ────────────────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  addForm: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  ingredient: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
    </svg>
  ),
  product: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M21 8l-9-5-9 5 9 5 9-5z"/>
      <path d="M3 8v8l9 5 9-5V8"/>
      <path d="M12 13v8"/>
    </svg>
  ),
  banner: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="12" rx="2"/>
      <path d="M2 15l5-4 4 3 5-5 6 6"/>
    </svg>
  ),
  usersControl: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="4"/>
      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/>
      <circle cx="19" cy="8" r="2.2"/>
      <path d="M19 12.5c1.8 0 3.2 1.2 3.2 3.5"/>
    </svg>
  ),
  verify: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z"/>
      <polyline points="9 12 11.3 14.3 15.5 10"/>
    </svg>
  ),
  imagekit: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="9" r="1.8"/>
      <path d="M21 15l-5.5-5.5L4 21"/>
    </svg>
  ),
  gemini: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>
    </svg>
  ),
  mongo: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="8" ry="3"/>
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/>
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  billing: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  team: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  api: (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <polyline points="16 18 22 12 16 6"/>
      <polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  bell: (
    <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  check: (
    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── Nav Config (Admin) ────────────────────────────────────────
// Adjust hrefs to match your actual admin route structure.
const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [
      { label: 'Dashboard',        href: '/admin',                       icon: Icon.dashboard },
      { label: 'Analytics',        href: '/admin/analytics',             icon: Icon.analytics },
    ],
  },
  {
    label: 'Content',
    links: [
      { label: 'Add Product',      href: '/admin/products/new',          icon: Icon.addForm   },
      { label: 'Add Ingredient',   href: '/admin/add-ingredients/new',   icon: Icon.addForm   },
      { label: 'Add Banner',       href: '/admin/banner/new',           icon: Icon.banner    },
    ],
  },
  {
    label: 'Manage',
    links: [
      { label: 'Products',         href: '/admin/products',              icon: Icon.product   },
      { label: 'Ingredients',      href: '/admin/ingredients',           icon: Icon.ingredient},
      { label: 'Banners',          href: '/admin/banners',               icon: Icon.banner    },
      { label: 'Users',            href: '/admin/users',                 icon: Icon.usersControl },
      { label: 'User Verification',href: '/admin/users/verify',          icon: Icon.verify    },
    ],
  },
  {
    label: 'Integrations',
    links: [
      { label: 'ImageKit',         href: '/admin/integrations/imagekit', icon: Icon.imagekit  },
      { label: 'Gemini AI',        href: '/admin/integrations/gemini',   icon: Icon.gemini    },
      { label: 'MongoDB',          href: '/admin/integrations/mongo',    icon: Icon.mongo     },
    ],
  },
  {
    label: 'Account',
    links: [
      { label: 'Team',             href: '/admin/team',                  icon: Icon.team      },
      { label: 'API Keys',         href: '/admin/settings/api',          icon: Icon.api       },
      { label: 'Settings',         href: '/admin/settings',              icon: Icon.settings  },
      { label: 'Billing',          href: '/admin/billing',               icon: Icon.billing   },
    ],
  },
];

// ─── Mock notifications ───────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'alert',
    title: '3 Users Pending Verification',
    body: 'New sign-ups are waiting on ID/document review.',
    time: '2m ago',
    read: false,
    color: T.amber,
  },
  {
    id: 2,
    type: 'insight',
    title: 'Gemini Sync Complete',
    body: 'Ingredient auto-tagging finished for 42 new products.',
    time: '18m ago',
    read: false,
    color: T.rose,
  },
  {
    id: 3,
    type: 'success',
    title: 'ImageKit Upload Batch Done',
    body: 'All banner assets processed and optimized.',
    time: '1h ago',
    read: false,
    color: '#3ECF8E',
  },
  {
    id: 4,
    type: 'info',
    title: 'MongoDB Backup Completed',
    body: 'Nightly database snapshot ran successfully.',
    time: '3h ago',
    read: true,
    color: T.violet,
  },
];

// ─── NotificationPanel ────────────────────────────────────────
function NotificationPanel({ open, onClose, notifications, onMarkRead, onMarkAllRead, unreadCount }) {
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  return (
    <>
      <style>{`
        @keyframes notif-slide-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes notif-item-in {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        .notif-item { animation: notif-item-in 0.22s ease both; }
        .notif-item:hover { background: rgba(245,240,235,0.04) !important; }
        .notif-mark-btn:hover { color: ${T.offWhite} !important; }
        .notif-close-row:hover { opacity: 0.8; }
      `}</style>

      {open && (
        <div
          ref={ref}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '360px',
            background: '#13101a',
            border: `1px solid ${T.border}`,
            borderRadius: '14px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            zIndex: 500,
            animation: 'notif-slide-in 0.22s ease both',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px 12px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: T.offWhite }}>Notifications</span>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: `linear-gradient(135deg, ${T.rose}, ${T.violet})`,
                  color: '#fff',
                  padding: '2px 7px', borderRadius: '20px',
                }}>{unreadCount}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="notif-mark-btn"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '11.5px', color: T.muted, transition: 'color 0.15s',
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(245,240,235,0.07)', border: 'none',
                  color: T.muted, cursor: 'pointer',
                  borderRadius: '6px', width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{Icon.close}</button>
            </div>
          </div>

          {/* Items */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: T.muted, fontSize: '13px' }}>
                All caught up ✓
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id}
                  className="notif-item"
                  style={{
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    padding: '14px 18px',
                    borderBottom: i < notifications.length - 1 ? `1px solid ${T.border}` : 'none',
                    background: n.read ? 'transparent' : 'rgba(255,62,127,0.03)',
                    transition: 'background 0.15s',
                    animationDelay: `${i * 0.05}s`,
                    cursor: 'default',
                  }}
                >
                  {/* Color dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: n.color, flexShrink: 0, marginTop: '5px',
                    boxShadow: n.read ? 'none' : `0 0 8px ${n.color}88`,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{
                        fontSize: '12.5px', fontWeight: n.read ? 500 : 700,
                        color: n.read ? T.muted : T.offWhite,
                        lineHeight: 1.3,
                      }}>{n.title}</span>
                      <span style={{ fontSize: '10.5px', color: 'rgba(245,240,235,0.25)', flexShrink: 0 }}>{n.time}</span>
                    </div>
                    <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: 'rgba(245,240,235,0.45)', lineHeight: 1.5 }}>
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="notif-mark-btn"
                      title="Mark as read"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(245,240,235,0.2)', flexShrink: 0, padding: '2px',
                        transition: 'color 0.15s',
                      }}
                    >{Icon.check}</button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '12px 18px',
            borderTop: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'center',
          }}>
            <Link href="/admin/notifications" style={{
              fontSize: '12px', color: T.rose, textDecoration: 'none', fontWeight: 600,
            }}>
              View all activity →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

// ─── NavLink ──────────────────────────────────────────────────
function NavLink({ href, label, icon, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '9px',
        padding: '8px 10px', borderRadius: '8px',
        fontSize: '13px', fontWeight: isActive ? 600 : 500,
        color: isActive ? T.offWhite : 'rgba(245,240,235,0.45)',
        background: isActive
          ? `linear-gradient(90deg, rgba(255,62,127,0.13), rgba(123,94,167,0.06))`
          : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{
        color: isActive ? T.rose : 'rgba(245,240,235,0.3)',
        transition: 'color 0.15s',
        display: 'flex', flexShrink: 0,
      }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {isActive && (
        <div style={{
          width: '4px', height: '4px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${T.rose}, ${T.violet})`,
          boxShadow: `0 0 6px ${T.rose}88`,
        }} />
      )}
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  const { users, fetchUsers } = useUserStore(
    useShallow((state) => ({ users: state.users, fetchUsers: state.fetchUsers }))
  );

  useEffect(() => {
    if (users.length === 0) fetchUsers();
  }, [fetchUsers, users.length]);

  function isActive(href) {
    if (href === '/admin') return pathname === '/admin' || pathname === '/admin/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <style>{`
        .sidebar-nav-link:hover { background: rgba(245,240,235,0.04) !important; color: rgba(245,240,235,0.75) !important; }
        .sidebar-nav-link:hover span:first-child { color: rgba(245,240,235,0.55) !important; }
      `}</style>

      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 190,
            backdropFilter: 'blur(3px)',
          }}
        />
      )}

      <aside
        className={`dash-sidebar-aside${open ? ' sidebar-open' : ''}`}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '224px', height: '100vh',
          background: T.navyEl,
          borderRight: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          zIndex: 200,
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '22px 18px 16px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
            background: `linear-gradient(135deg, ${T.rose}, ${T.violet})`,
            boxShadow: `0 0 14px ${T.rose}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white" opacity="0.9"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: T.offWhite, letterSpacing: '0.03em' }}>DermAI</div>
            <div style={{ fontSize: '9.5px', color: 'rgba(245,240,235,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Console</div>
          </div>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close menu"
            style={{
              background: T.faint, border: 'none',
              color: T.muted, cursor: 'pointer',
              borderRadius: '6px', width: '28px', height: '28px',
              display: 'none', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >{Icon.close}</button>
        </div>

        <div style={{ height: '1px', background: T.border, margin: '0 18px 12px' }} />

        {/* Nav Sections */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={{
                fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(245,240,235,0.22)',
                padding: '0 8px 7px',
              }}>
                {section.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {section.links.map(({ label, href, icon }) => (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={icon}
                    isActive={isActive(href)}
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Status Banner */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{
            background: `linear-gradient(135deg, rgba(255,62,127,0.12), rgba(123,94,167,0.12))`,
            border: `1px solid rgba(255,62,127,0.2)`,
            borderRadius: '10px',
            padding: '12px',
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: T.offWhite, marginBottom: '3px' }}>
              Admin Access
            </div>
            <div style={{ fontSize: '10.5px', color: 'rgba(245,240,235,0.45)', lineHeight: 1.4, marginBottom: '8px' }}>
              3 users awaiting verification
            </div>
            <div style={{
              height: '3px', borderRadius: '99px',
              background: 'rgba(245,240,235,0.1)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: '68%', borderRadius: '99px',
                background: `linear-gradient(90deg, ${T.rose}, ${T.violet})`,
              }} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px 16px', borderTop: `1px solid ${T.border}` }}>
          <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.18)', letterSpacing: '0.04em' }}>
            v2.1.0 · Admin Console
          </span>
        </div>
      </aside>
    </>
  );
}

// ─── TopNav ───────────────────────────────────────────────────
function TopNav({ onMenuToggle }) {
  const currentUser = useUserStore((state) => state.users);
  const pathname = usePathname();

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }
  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  // Find active page label
  const allLinks = NAV_SECTIONS.flatMap(s => s.links);
  const pageTitle = allLinks.find(l =>
    l.href === '/admin'
      ? pathname === '/admin' || pathname === '/admin/'
      : pathname.startsWith(l.href)
  )?.label ?? 'Dashboard';

  const displayName = currentUser?.full_name ?? currentUser?.email ?? 'Admin';
  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (currentUser?.email?.[0]?.toUpperCase() ?? 'A');

  return (
    <>
      <style>{`
        @keyframes bell-shake {
          0%,100% { transform: rotate(0); }
          15%      { transform: rotate(15deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(9deg); }
          60%      { transform: rotate(-6deg); }
          75%      { transform: rotate(3deg); }
        }
        .bell-btn { position: relative; transition: background 0.15s, border-color 0.15s; }
        .bell-btn:hover { background: rgba(245,240,235,0.1) !important; }
        .bell-btn.has-notif .bell-icon { animation: bell-shake 1.2s ease 0.3s; }
        .notif-dot-pulse {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: ${T.rose};
          border: 1.5px solid ${T.navyMid};
          animation: pulse-ring 1.8s ease infinite;
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(255,62,127,0.6); }
          70%  { box-shadow: 0 0 0 5px rgba(255,62,127,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,62,127,0); }
        }
        .user-chip:hover { background: rgba(245,240,235,0.09) !important; }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '58px',
        background: 'rgba(10,10,26,0.95)',
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(20px)',
        gap: '16px',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onMenuToggle}
            className="mob-menu-btn"
            aria-label="Toggle menu"
            style={{
              background: 'none', border: 'none',
              color: T.muted, cursor: 'pointer',
              padding: '4px', borderRadius: '6px',
              display: 'none',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <span style={{ color: 'rgba(245,240,235,0.3)', fontWeight: 500 }}>Admin</span>
            <span style={{ color: 'rgba(245,240,235,0.15)' }}>/</span>
            <span style={{ color: T.offWhite, fontWeight: 700 }}>{pageTitle}</span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Session badge */}
          <span className="nav-session-badge" style={{
            fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.06em',
            color: '#3ECF8E',
            background: 'rgba(62,207,142,0.1)',
            border: '1px solid rgba(62,207,142,0.2)',
            padding: '3px 10px', borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3ECF8E', display: 'inline-block' }} />
            Live
          </span>

          {/* Bell */}
          <div ref={bellRef} style={{ position: 'relative' }}>
            <button
              className={`bell-btn${unreadCount > 0 ? ' has-notif' : ''}`}
              onClick={() => setNotifOpen(p => !p)}
              style={{
                background: notifOpen ? 'rgba(245,240,235,0.09)' : 'rgba(245,240,235,0.05)',
                border: `1px solid ${notifOpen ? 'rgba(255,62,127,0.3)' : T.border}`,
                color: T.muted, cursor: 'pointer',
                borderRadius: '9px', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              aria-label="Notifications"
            >
              <span className="bell-icon">{Icon.bell}</span>
              {unreadCount > 0 && <span className="notif-dot-pulse" />}
            </button>

            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              onMarkRead={markRead}
              onMarkAllRead={markAllRead}
              unreadCount={unreadCount}
            />
          </div>

          {/* User chip */}
          <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
            <div className="user-chip" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '4px 12px 4px 4px',
              background: 'rgba(245,240,235,0.05)',
              border: `1px solid ${T.border}`,
              borderRadius: '30px', cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={displayName}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    objectFit: 'cover',
                    border: `1.5px solid rgba(255,62,127,0.4)`,
                  }}
                />
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${T.rose}, ${T.violet})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 800, color: '#fff',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
              )}
              <div className="nav-user-name-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{
                  fontSize: '12.5px', fontWeight: 700, color: T.offWhite,
                  maxWidth: '110px', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(245,240,235,0.3)' }}>
                  Administrator
                </span>
              </div>
              <span style={{ color: 'rgba(245,240,235,0.2)' }}>{Icon.chevron}</span>
            </div>
          </Link>
        </div>
      </header>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .dash-body-content { margin-left: 224px; }
        .mob-menu-btn { display: none !important; }
        .dash-sidebar-aside { transform: translateX(0); }
        @media (max-width: 768px) {
          .dash-body-content { margin-left: 0 !important; }
          .mob-menu-btn { display: flex !important; }
          .dash-sidebar-aside { transform: translateX(-100%); }
          .dash-sidebar-aside.sidebar-open { transform: translateX(0) !important; }
          .sidebar-close-btn { display: flex !important; }
          .nav-session-badge { display: none !important; }
          .nav-user-name-text { display: none !important; }
        }
        @media (max-width: 420px) {
          .nav-bell-btn { display: none !important; }
        }
        /* Subtle scrollbar */
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(245,240,235,0.1); border-radius: 99px; }
      `}</style>

      <div style={{
        display: 'flex', minHeight: '100vh',
        background: T.navy,
        fontFamily: "'Inter', -apple-system, sans-serif",
        overflowX: 'hidden',
        color: T.offWhite,
      }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="dash-body-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopNav onMenuToggle={() => setSidebarOpen(p => !p)} />
          <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}