import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

// ألوان براند لاليان (تدرجات الذهبي)
const COLORS = ['#d4af37', '#b8860b', '#daa520', '#ffd700', '#eee8aa'];

export const TopProductsChart = ({ data }) => {
    return (
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-border-color shadow-lg h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-primary uppercase tracking-widest">
                    Top 5 Products
                </h3>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ left: 30, right: 30 }}
                    >
                        {/* شبكة الرسم البياني */}
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#333"
                            horizontal={false}
                        />

                        {/* المحور الأفقي - يعبر عن الكمية المباعة */}
                        <XAxis
                            type="number"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />

                        {/* المحور الرأسي - يعبر عن أسماء المنتجات */}
                        <YAxis
                            dataKey="name" // تم التعديل ليطابق مخرجات الداتا بيز
                            type="category"
                            stroke="#ccc"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            width={120}
                        />

                        {/* نافذة التفاصيل عند الوقوف بالماوس */}
                        <Tooltip
                            cursor={{ fill: 'rgba(212, 175, 55, 0.05)' }}
                            contentStyle={{
                                backgroundColor: '#1a1a1a',
                                borderColor: '#333',
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#d4af37' }}
                            formatter={(value) => [`${value} Units`, 'Sold']}
                        />

                        {/* الأعمدة */}
                        <Bar
                            dataKey="total_sold" // تم التعديل ليطابق مخرجات الداتا بيز
                            radius={[0, 4, 4, 0]}
                            barSize={30}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};