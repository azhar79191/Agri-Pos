import React from 'react';
import { Shield } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import AuditPanel from './hub/AuditPanel';

// Legacy entry point shares the real, paginated audit trail and its retry state.
export default function AuditLogs() {
  return <div className="space-y-6"><PageHeader icon={Shield} title="Audit Logs" description="Review recorded team activity" /><AuditPanel /></div>;
}
