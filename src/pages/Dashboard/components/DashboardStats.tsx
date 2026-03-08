import React from 'react';

interface Stat {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

interface StatusCard {
    label: string;
    count: number;
    color: string;
    bg: string;
}

interface DashboardStatsProps {
    stats: Stat[];
    statusCards: StatusCard[];
    todayOrdersCount: number;
    todayRevenue: number;
    conversionRate: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
    stats,
    statusCards,
    todayOrdersCount,
    todayRevenue,
    conversionRate
}) => {
    return (
        <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-background-card p-6 rounded-xl border border-border-color flex items-center gap-6">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary/20">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-text-secondary text-sm uppercase tracking-wider font-semibold mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-text-primary">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Breakdown */}
            <div className="bg-background-card rounded-xl border border-border-color p-6">
                <h2 className="text-lg font-bold tracking-widest uppercase text-primary mb-4">Order Status Breakdown</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {statusCards.map((s, i) => (
                        <div key={i} className={`rounded-lg border p-4 text-center ${s.bg}`}>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                            <p className="text-xs text-text-secondary mt-1 font-semibold">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Today's Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-card rounded-xl border border-border-color p-5">
                    <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">Today's Orders</p>
                    <h3 className="text-2xl font-bold text-text-primary">{todayOrdersCount}</h3>
                </div>
                <div className="bg-background-card rounded-xl border border-border-color p-5">
                    <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">Today's Revenue</p>
                    <h3 className="text-2xl font-bold text-primary">{todayRevenue.toLocaleString()} EGP</h3>
                </div>
                <div className="bg-background-card rounded-xl border border-border-color p-5">
                    <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold mb-1">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-green-400">{conversionRate}%</h3>
                    <p className="text-[10px] text-text-secondary mt-1">Delivered / Total</p>
                </div>
            </div>
        </div>
    );
};
