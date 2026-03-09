import React from 'react';
import * as RechartsModule from 'recharts';
// @ts-ignore
const { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = (RechartsModule.default || RechartsModule) as any;

interface SalesTrendChartProps {
    data: any[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ data }) => {
    return (
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-border-color shadow-lg h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-primary uppercase tracking-widest">Sales Trend</h3>
            </div>
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            }}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `${val.toLocaleString()} EGP`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#d4af37' }}
                            labelStyle={{ marginBottom: '8px', color: '#888' }}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#d4af37"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            // @ts-ignore
                            dot={{ fill: '#1a1a1a', stroke: '#d4af37', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#d4af37' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesTrendChart;
