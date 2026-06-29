import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { ShieldAlert, Building2, Users, ExternalLink } from 'lucide-react';
import { NumberTicker } from '../components/ui/number-ticker';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to load admin stats. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar activeTab="admin" setActiveTab={() => {}} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground animate-pulse">
          Loading admin panel...
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar activeTab="admin" setActiveTab={() => {}} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You must be logged in as an administrator to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activeTab="admin" setActiveTab={() => {}} />
      </div>

      <main className="flex-1 overflow-y-auto p-6 md:px-10 pt-24 md:pt-24 lg:pt-10 lg:p-10 pb-10 space-y-8">
        
        {/* Header */}
        <div className="pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-foreground">Super Admin Panel</h1>
              <p className="text-muted-foreground">Platform-wide overview and analytics.</p>
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Properties</p>
                <p className="text-3xl font-heading font-bold"><NumberTicker value={stats.totalHomestays} /></p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Free Users</p>
                <p className="text-3xl font-heading font-bold"><NumberTicker value={stats.freePlanCount} /></p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Paid Users</p>
                <p className="text-3xl font-heading font-bold"><NumberTicker value={stats.paidPlanCount} /></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-sm border-border overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle>Platform Properties</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Property Name</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Owner</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Location</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Subscription</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Expiry Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.properties.map((prop) => (
                    <tr key={prop._id} className="bg-white hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        <NavLink to={`/p/${prop.publicSlug}`} target="_blank" className="hover:text-primary hover:underline flex items-center gap-1">
                          {prop.propertyName} <ExternalLink className="w-3 h-3" />
                        </NavLink>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{prop.ownerName}</div>
                        <div className="text-xs text-muted-foreground">{prop.ownerEmail}</div>
                      </td>
                      <td className="px-6 py-4">{prop.region}, {prop.state}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${prop.ownerPlan === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                          {prop.ownerPlan.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {prop.ownerPlan === 'paid' ? 'Dec 31, 2026' : 'N/A (Free)'}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-medium">{prop.pageViews}</td>
                    </tr>
                  ))}
                  {stats.properties.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                        No properties found on the platform.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Mobile Nav Header (Visible only on lg and below) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 justify-between z-40">
        <div className="flex items-center gap-2 text-lg font-heading font-bold text-primary">
          <ShieldAlert className="w-5 h-5 text-red-600" /> Admin
        </div>
        <NavLink to="/dashboard" className="text-sm font-semibold text-primary">
          Back to Dashboard
        </NavLink>
      </div>

    </div>
  );
};

export default AdminDashboard;
