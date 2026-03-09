import React from 'react';
import { TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react';

interface KPICardsProps {
    stats: {
        totalRevenue?: number;
        totalOrders?: number;
        aov?: number;
        newCustomers?: number;
        revenueTrend?: number;
        ordersTrend?: number;
        customersTrend?: number;
    };
}

export const KPICards: React.FC<KPICardsProps> = ({ stats }) => {
    const cards = [
        {
            label: 'Total Revenue',
            value: `${stats.totalRevenue?.toLocaleString() || 0} EGP`,
            icon: <DollarSign className="text-primary" size={24} />,
            trend: stats.revenueTrend
        },
        {
            label: 'Total Orders',
            value: stats.totalOrders || 0,
            icon: <ShoppingCart className="text-primary" size={24} />,
            trend: stats.ordersTrend
        },
        {
            label: 'Avg. Order Value',
            value: `${Math.round(stats.aov || 0).toLocaleString()} EGP`,
            icon: <TrendingUp className="text-primary" size={24} />,
            trend: null
        },
        {
            label: 'New Customers',
            value: stats.newCustomers || 0,
            icon: <Users className="text-primary" size={24} />,
            trend: stats.customersTrend
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-border-color shadow-lg hover:border-primary/50 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 group-hover:bg-primary/20 transition-colors">
                            {card.icon}
                        </div>
                    </div>
                    <div>
                        <p className="text-text-secondary text-xs uppercase tracking-widest font-bold mb-1">{card.label}</p>
                        <h3 className="text-2xl font-bold text-white tracking-tight">{card.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPICards;
