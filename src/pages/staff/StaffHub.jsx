import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StaffNav    from "./hub/StaffNav";
import UsersPanel  from "./hub/UsersPanel";
import RepsPanel   from "./hub/RepsPanel";
import PermsPanel  from "./hub/PermsPanel";
import AuditPanel  from "./hub/AuditPanel";
import OverviewPanel from "./hub/OverviewPanel";
import { useUsers } from "../../hooks/useUsers";
import { STAFF_NAV } from "./hub/staffConfig";

const ALL_ITEMS = STAFF_NAV.flatMap(g => g.items);

// Map sidebar child ids to panel ids
const ROUTE_MAP = {
  "staff":            "users",
  "staff/users":      "users",
  "staff/reps":       "reps",
  "staff/audit":      "audit",
  "staff/overview":   "overview",
  // legacy routes
  "staff/sales-reps": "reps",
  "staff/audit-logs": "audit",
  "users":            "users",
};

const PANELS = {
  users:    <UsersPanel />,
  reps:     <RepsPanel />,
  perms:    <PermsPanel />,
  audit:    <AuditPanel />,
  overview: <OverviewPanel />,
};

const StaffHub = () => {
  const location = useLocation();
  const { users } = useUsers();

  const getPanel = () => {
    const path = location.pathname.replace(/^\//, "");
    return ROUTE_MAP[path] || "users";
  };

  const [active, setActive] = useState(getPanel);

  useEffect(() => {
    setActive(getPanel());
  }, [location.pathname]); // eslint-disable-line

  const current = ALL_ITEMS.find(i => i.id === active);

  return (
    <div className="animate-fade-up space-y-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-slate-400 dark:text-slate-500">Staff</span>
        <span className="text-xs text-slate-300 dark:text-slate-600">/</span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{current?.label}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left nav */}
        <StaffNav active={active} onChange={setActive} userCount={users.length} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {PANELS[active] ?? null}
        </div>
      </div>
    </div>
  );
};

export default StaffHub;
