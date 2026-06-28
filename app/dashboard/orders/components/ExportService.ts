// app/dashboard/orders/components/ExportService.ts
// Converted from: lib/pages/orders/export_service.dart

export function exportOrdersCSV(orders: any[], currencySymbol = '$') {
  const headers = ['Order ID','Item','Buyer','Price','Risk','Status','Protected','Created']
  const rows = orders.map(o => [
    o.ebay_order_id || '',
    `"${(o.item_title || '').replace(/"/g, '""')}"`,
    o.buyer_username || '',
    `${currencySymbol}${Number(o.item_price || 0).toFixed(2)}`,
    o.risk_level || 'LOW',
    o.order_status || 'pending',
    o.checklist_completed ? 'Yes' : 'No',
    o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `riazify_orders_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
