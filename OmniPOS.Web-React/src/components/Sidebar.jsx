import React from 'react';
import { useStore } from '../store/useStore';
import { Building2, RefreshCw, Terminal, LayoutDashboard, Coffee, Layers, Users, Map, ShoppingCart, ShieldCheck, ChefHat, UserCircle, CreditCard, Calendar as CalendarIcon, User, BarChart3, Briefcase, Coins } from 'lucide-react';

const Sidebar = ({ onClose }) => {
    const tenants = useStore(state => state.tenants);
    const currentTenantId = useStore(state => state.currentTenantId);
    const setTenant = useStore(state => state.setTenant);
    const orders = useStore(state => state.orders);
    const logs = useStore(state => state.logs);
    const syncOrders = useStore(state => state.syncOrders);
    const currentView = useStore(state => state.currentView);
    const setView = useStore(state => state.setView);
    const user = useStore(state => state.user);
    const logout = useStore(state => state.logout);

    const handleViewChange = (viewId) => {
        setView(viewId);
        if (onClose) onClose();
    };

    const allNavItems = [
        { id: 'Dashboard', label: 'Active Orders', icon: LayoutDashboard, roles: ['Admin', 'Owner', 'Manager', 'Kitchen', 'Chef', 'Assistant Chef', 'Waiter', 'Till'] },
        { id: 'FloorPlan', label: 'Tables', icon: Map, roles: ['Admin', 'Owner', 'Manager', 'Waiter', 'Till'] },
        { id: 'Menu', label: 'Menu Editor', icon: Coffee, roles: ['Admin', 'Owner', 'Manager', 'Kitchen', 'Chef', 'Assistant Chef'] },
        { id: 'Inventory', label: 'Inventory', icon: Layers, roles: ['Admin', 'Owner', 'Manager', 'Kitchen', 'Chef'] },
        { id: 'Staff', label: 'Staff Rota', icon: Users, roles: ['Admin', 'Owner', 'Manager'] },
        { id: 'OrderEntry', label: 'New Order', icon: ShoppingCart, roles: ['Admin', 'Owner', 'Manager', 'Waiter', 'Till'] },
        { id: 'Payments', label: 'Payments', icon: CreditCard, roles: ['Admin', 'Owner', 'Manager', 'Till'] },
        { id: 'Reservations', label: 'Reservations', icon: CalendarIcon, roles: ['Admin', 'Owner', 'Manager', 'Waiter', 'Till'] },
        { id: 'Customers', label: 'Customers', icon: User, roles: ['Admin', 'Owner', 'Manager', 'Waiter', 'Till'] },
        { id: 'StaffUsers', label: 'User Mgmt', icon: ShieldCheck, roles: ['Admin', 'Owner', 'Manager'] },
        { id: 'Analytics', label: 'Analytics', icon: BarChart3, roles: ['Admin', 'Owner', 'Manager'] },
        { id: 'Tenants', label: 'Tenants', icon: Building2, roles: ['Admin', 'Owner', 'Manager'] },
        { id: 'Branding', label: 'Branding', icon: ShieldCheck, roles: ['Admin'] },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user.role));

    const tenantOrders = orders.filter(o => o.tenantId === currentTenantId);
    const offlineCount = tenantOrders.filter(o => o.syncStatus === 'Offline').length;

    const roles = [
        { id: 'Admin', icon: ShieldCheck, color: 'text-primary' },
        { id: 'Owner', icon: UserCircle, color: 'text-secondary' },
        { id: 'Manager', icon: Briefcase, color: 'text-success' },
        { id: 'Till', icon: Coins, color: 'text-info' },
        { id: 'Kitchen', icon: ChefHat, color: 'text-warning' },
        { id: 'Chef', icon: ChefHat, color: 'text-warning' },
        { id: 'Assistant Chef', icon: ChefHat, color: 'text-warning' },
        { id: 'Waiter', icon: User, color: 'text-muted' },
    ];

    return (
        <aside className="flex flex-col gap-6">
            {/* User Profile & Role Switcher */}
            <div className="glass-card p-6 rounded-3xl border-b-4 border-primary/20">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-2xl bg-glass/20 ${roles.find(r => r.id === user.role)?.color}`}>
                        {React.createElement(roles.find(r => r.id === user.role)?.icon || ShieldCheck, { size: 24 })}
                    </div>
                    <div>
                        <h3 className="font-black text-text leading-none">{user.fullName}</h3>
                        <span className="text-[10px] font-black uppercase text-muted tracking-tighter">Role: {user.role}</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={12} className="rotate-45" /> Sign Out
                </button>
            </div>

            <div className="glass-card p-6 rounded-3xl flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <Building2 size={20} className="text-primary" />
                    <h3 className="font-bold text-lg text-text">Tenant Context</h3>
                </div>

                <select
                    value={currentTenantId}
                    onChange={(e) => setTenant(e.target.value)}
                    className="w-full bg-glass/40 border border-text/10 rounded-xl p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer text-xs font-bold"
                >
                    {tenants.map(t => (
                        <option key={t.id} value={t.id} className="bg-bg text-text">{t.name}</option>
                    ))}
                </select>

                <div className="mt-8 flex flex-col gap-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleViewChange(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-xs ${currentView === item.id
                                ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/5'
                                : 'text-muted hover:text-text hover:bg-glass/20 border border-transparent'
                                }`}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {(user.role === 'Admin' || user.role === 'Waiter' || user.role === 'Till') && (
                    <>
                        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-text/10 pt-6">
                            <div className="bg-glass/20 p-4 rounded-2xl text-center border border-text/10">
                                <div className="text-2xl font-black text-primary">{offlineCount}</div>
                                <div className="text-[10px] uppercase font-bold text-muted tracking-widest">Unsynced Loop</div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-2 text-muted">
                                    <RefreshCw size={16} className="text-secondary" />
                                    <h3 className="font-bold text-sm text-text">Offline Sync</h3>
                                </div>
                                <button
                                    onClick={syncOrders}
                                    className="p-1.5 hover:bg-glass/20 rounded-lg transition-colors text-secondary"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </div>
                            <div className="bg-glass/40 rounded-xl p-3 h-32 font-mono text-[9px] text-muted overflow-y-auto scrollbar-hide border border-text/10">
                                {logs.map((log, i) => (
                                    <div key={i} className="mb-1 border-l border-text/10 pl-2">{log}</div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
