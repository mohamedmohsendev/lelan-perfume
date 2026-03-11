import React, { useDeferredValue } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
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
    const { t } = useLanguage();
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
                <h2 className="text-lg font-bold tracking-widest uppercase text-primary">{t('admin.orders.title')}</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                        <Download size={16} />
                        {t('admin.orders.export')}
                    </button>
                    <button
                        onClick={onClearAll}
                        className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                        <Trash2 size={16} />
                        {t('admin.orders.exportClear')}
                    </button>
                    <input
                        type="text"
                        placeholder={t('admin.orders.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 bg-white dark:bg-[#1A1C1D] text-gray-900 dark:text-gray-100 border border-border-color rounded p-2 text-sm focus:border-primary outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="flex-1 overflow-auto hidden md:block">
                {loading ? (
                    <div className="p-12 text-center text-text-secondary italic tracking-widest uppercase text-xs">{t('admin.orders.loading')}</div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="bg-background-dark text-text-secondary uppercase text-[10px] tracking-[0.2em] font-black border-b border-border-color/20 sticky top-0 z-10">
                            <tr>
                                <th className="p-6 font-semibold whitespace-nowrap">{t('admin.orders.date')}</th>
                                <th className="p-6 font-semibold">{t('admin.orders.customer')}</th>
                                <th className="p-6 font-semibold text-center">{t('admin.orders.items')}</th>
                                <th className="p-6 font-semibold whitespace-nowrap">{t('admin.orders.total')}</th>
                                <th className="p-6 font-semibold text-right">{t('admin.orders.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color/10 text-sm">
                            {filteredOrders.map(order => (
                                <tr key={order.id} className="hover:bg-primary/[0.02] transition-colors group">
                                    <td className="p-6 align-top">
                                        <div className="font-black text-primary text-xs tracking-widest mb-1 uppercase">
                                            #{order.id.split('-')[0]}
                                        </div>
                                        <div className="text-[10px] text-text-secondary font-bold tracking-wider uppercase opacity-60">
                                            {new Date(order.created_at).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="font-bold text-text-primary mb-1 tracking-wide">{order.customer_name}</div>
                                        <div className="text-xs text-text-secondary font-medium mb-1">{order.phone}</div>
                                        <div className="text-[10px] text-text-secondary opacity-70 tracking-tight" title={order.address}>
                                            {order.address}
                                        </div>
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.cart?.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-[10px] bg-background-dark/30 p-2 rounded border border-border-color/10">
                                                    <span className="truncate pr-2 font-black tracking-wider uppercase">
                                                        {item.quantity}x {item.name || item.product?.name || 'N/A'}
                                                        {item.size ? ` (${item.size})` : ''}
                                                    </span>
                                                    <span className="text-highlight font-black whitespace-nowrap">
                                                        {item.sizePrice || item.price || item.product?.price}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {order.notes && (
                                            <div className="mt-2 text-[9px] text-primary/80 bg-primary/5 p-2 rounded border border-primary/20 italic font-medium leading-relaxed">
                                                {t('admin.orders.note')}: {order.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-6 align-top">
                                        <div className="flex flex-col">
                                            <span className="font-black text-highlight text-lg tracking-wider">
                                                {order.total.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-text-secondary font-bold tracking-widest uppercase opacity-50">EGP</span>
                                        </div>
                                    </td>
                                    <td className="p-6 align-top text-right">
                                        <div className="flex flex-col items-end gap-3">
                                            <select
                                                value={order.status}
                                                onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                                className={`
                                                text-[10px] font-black tracking-[0.15em] uppercase px-4 py-2 rounded-full border-2 outline-none cursor-pointer appearance-none transition-all text-center min-w-[120px]
                                                ${order.status === 'معلق' ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20 hover:border-yellow-500/50' : ''}
                                                ${order.status === 'تم تأكيده' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20 hover:border-blue-500/50' : ''}
                                                ${order.status === 'تم توصيله' ? 'bg-green-500/5 text-green-500 border-green-500/20 hover:border-green-500/50' : ''}
                                                ${order.status === 'تم ارجاعه' ? 'bg-purple-500/5 text-purple-500 border-purple-500/20 hover:border-purple-500/50' : ''}
                                                ${order.status === 'لم يتم' ? 'bg-red-500/5 text-red-500 border-red-500/20 hover:border-red-500/50' : ''}
                                            `}
                                            >
                                                <option value="معلق">{t('admin.stats.pending')} (معلق)</option>
                                                <option value="تم تأكيده">{t('admin.stats.confirmed')} (مؤكد)</option>
                                                <option value="تم توصيله">{t('admin.stats.delivered')} (توصيل)</option>
                                                <option value="تم ارجاعه">{t('admin.stats.returned')} (مرتجع)</option>
                                                <option value="لم يتم">{t('admin.stats.failed')} (فشل)</option>
                                            </select>
                                            <button
                                                onClick={() => onDeleteOrder(order.id)}
                                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 transition-all group/btn"
                                            >
                                                <Trash2 size={12} className="opacity-40 group-hover/btn:opacity-100" />
                                                <span>{t('admin.orders.deleteRecord')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="flex-1 overflow-auto md:hidden p-4 space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-text-secondary animate-pulse tracking-widest uppercase text-xs">{t('admin.orders.loading')}</div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-background-dark/40 rounded-2xl border border-border-color/30 p-5 space-y-4 shadow-xl">
                            <div className="flex justify-between items-start border-b border-border-color/10 pb-3">
                                <div>
                                    <div className="font-black text-primary text-xs tracking-[0.2em] uppercase mb-1">
                                        #{order.id.split('-')[0]}
                                    </div>
                                    <div className="text-[10px] text-text-secondary font-bold tracking-wider uppercase opacity-60">
                                        {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-highlight text-lg leading-tight">{order.total.toLocaleString()}</div>
                                    <div className="text-[9px] text-text-secondary font-black tracking-widest uppercase opacity-40">EGP</div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-sm font-black text-text-primary tracking-wide">{order.customer_name}</div>
                                <div className="text-xs text-primary font-bold tracking-widest">{order.phone}</div>
                                <div className="text-[11px] text-text-secondary leading-relaxed opacity-80">{order.address}</div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3 space-y-2 border border-border-color/5">
                                {order.cart?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-[11px]">
                                        <span className="font-bold text-text-secondary">
                                            {item.quantity}x <span className="text-text-primary">{item.name || item.product?.name}</span>
                                        </span>
                                        <span className="text-highlight font-black">{item.sizePrice || item.price || item.product?.price}</span>
                                    </div>
                                ))}
                                {order.notes && (
                                    <div className="mt-2 text-[10px] text-primary/70 italic border-l-2 border-primary/30 pl-2 py-1">
                                        {order.notes}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 pt-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                    className={`
                                    flex-1 text-[10px] font-black tracking-[0.15em] uppercase px-4 py-3 rounded-xl border-2 outline-none cursor-pointer appearance-none transition-all text-center
                                    ${order.status === 'معلق' ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20' : ''}
                                    ${order.status === 'تم تأكيده' ? 'bg-blue-500/5 text-blue-500 border-blue-500/20' : ''}
                                    ${order.status === 'تم توصيله' ? 'bg-green-500/5 text-green-500 border-green-500/20' : ''}
                                    ${order.status === 'تم ارجاعه' ? 'bg-purple-500/5 text-purple-500 border-purple-500/20' : ''}
                                    ${order.status === 'لم يتم' ? 'bg-red-500/5 text-red-500 border-red-500/20' : ''}
                                `}
                                >
                                    <option value="معلق">{t('admin.stats.pending')}</option>
                                    <option value="تم تأكيده">{t('admin.stats.confirmed')}</option>
                                    <option value="تم توصيله">{t('admin.stats.delivered')}</option>
                                    <option value="تم ارجاعه">{t('admin.stats.returned')}</option>
                                    <option value="لم يتم">{t('admin.stats.failed')}</option>
                                </select>
                                <button
                                    onClick={() => onDeleteOrder(order.id)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-95 transition-transform"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && filteredOrders.length === 0 && (
                <div className="p-12 text-center text-text-secondary tracking-widest uppercase text-xs opacity-50">{t('admin.orders.empty')}</div>
            )}
        </div>
    );
};
