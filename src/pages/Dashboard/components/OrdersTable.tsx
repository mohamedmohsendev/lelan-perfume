import React, { useDeferredValue } from 'react';
import { Download, Trash2 } from 'lucide-react';
import type { Order } from '../types';

interface OrdersTableProps {
    orders: Order[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    onExport: () => void;
    onClearAll: () => void;
    onUpdateStatus: (id: string, status: string) => void;
    onDeleteOrder: (id: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
    orders,
    loading,
    searchTerm,
    setSearchTerm,
    onExport,
    onClearAll,
    onUpdateStatus,
    onDeleteOrder
}) => {
    const deferredSearchTerm = useDeferredValue(searchTerm);

    const filteredOrders = React.useMemo(() => {
        if (!deferredSearchTerm) return orders;
        const term = deferredSearchTerm.toLowerCase();
        return orders.filter(o =>
            (o.id || '').toLowerCase().includes(term) ||
            (o.customer_name || '').toLowerCase().includes(term) ||
            (o.phone || '').includes(term)
        );
    }, [orders, deferredSearchTerm]);

    return (
        <div className="bg-background-card rounded-xl border border-border-color overflow-hidden flex flex-col h-[700px]">
            <div className="p-6 border-b border-border-color flex flex-col md:flex-row justify-between items-start md:items-center bg-background-dark gap-4">
                <h2 className="text-lg font-bold tracking-widest uppercase text-primary">Orders</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                        <Download size={16} />
                        Export
                    </button>
                    <button
                        onClick={onClearAll}
                        className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                        <Trash2 size={16} />
                        Export & Clear
                    </button>
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 bg-white dark:bg-[#1A1C1D] text-gray-900 dark:text-gray-100 border border-border-color rounded p-2 text-sm focus:border-primary outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="p-12 text-center text-text-secondary">Loading orders...</div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-gray-100 dark:bg-[#1A1C1D] text-text-secondary uppercase text-[10px] sm:text-xs tracking-widest sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 font-semibold whitespace-nowrap">Order ID / Date</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Items</th>
                                <th className="p-4 font-semibold whitespace-nowrap">Total</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color text-sm">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 align-top">
                                        <div className="font-mono text-xs text-primary mb-1">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </div>
                                        <div className="text-[11px] text-text-secondary">
                                            {new Date(order.created_at).toLocaleString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-bold text-text-primary mb-1">{order.customer_name}</div>
                                        <div className="text-xs text-text-secondary mb-1">{order.phone}</div>
                                        <div className="text-[11px] text-text-secondary max-w-[200px] truncate" title={order.address}>
                                            {order.address}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="space-y-1 max-h-20 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.cart?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-[11px] bg-white dark:bg-[#1A1C1D] text-gray-900 dark:text-gray-100 p-2 rounded shadow-sm border border-border-color">
                                                    <span className="truncate pr-2 font-medium">
                                                        {item.quantity}x {item.name || item.product?.name || 'N/A'}
                                                        {item.size ? ` (${item.size})` : ''}
                                                    </span>
                                                    <span className="text-highlight font-bold whitespace-nowrap mt-[1px]">
                                                        {item.sizePrice || item.price || item.product?.price}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && (
                                            <div className="mt-2 text-[10px] text-[#C6A664] bg-[#C6A664]/5 p-2 rounded border border-[#C6A664]/20 font-medium">
                                                Note: {order.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className="font-bold text-highlight text-base">
                                            {order.total.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-text-secondary ml-1">EGP</span>
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                                className={`
                                                text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none transition-colors w-full
                                                ${order.status === 'معلق' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20 hover:border-yellow-500/50' : ''}
                                                ${order.status === 'تم تأكيده' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20 hover:border-blue-500/50' : ''}
                                                ${order.status === 'تم توصيله' ? 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20 hover:border-green-500/50' : ''}
                                                ${order.status === 'تم ارجاعه' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20 hover:border-purple-500/50' : ''}
                                                ${order.status === 'لم يتم' ? 'bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20 hover:border-red-500/50' : ''}
                                            `}
                                            >
                                                <option value="معلق" className="bg-white dark:bg-[#1A1C1D] text-yellow-600 dark:text-yellow-500">معلق</option>
                                                <option value="تم تأكيده" className="bg-white dark:bg-[#1A1C1D] text-blue-600 dark:text-blue-500">تم تأكيده</option>
                                                <option value="تم توصيله" className="bg-white dark:bg-[#1A1C1D] text-green-600 dark:text-green-500">تم توصيله</option>
                                                <option value="تم ارجاعه" className="bg-white dark:bg-[#1A1C1D] text-purple-600 dark:text-purple-500">تم ارجاعه</option>
                                                <option value="لم يتم" className="bg-white dark:bg-[#1A1C1D] text-red-600 dark:text-red-500">لم يتم</option>
                                            </select>
                                            <button
                                                onClick={() => onDeleteOrder(order.id)}
                                                className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-500 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-500/40 px-3 py-1 rounded transition-all"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={12} />
                                                <span>حذف</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-text-secondary">No orders found.</div>
                )}
            </div>
        </div>
    );
};
