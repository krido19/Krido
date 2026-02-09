import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const InvoicePrint = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const invoiceRef = useRef(null);
    const [order, setOrder] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoData, setLogoData] = useState(null);

    // Load logo for PDF
    useEffect(() => {
        const loadLogo = async () => {
            try {
                const response = await fetch('/logo.png');
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoData(reader.result);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error loading logo:', error);
            }
        };
        loadLogo();
    }, []);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            // Fetch profile for business info
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .limit(1)
                .single();

            setProfile(profileData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Gagal memuat data invoice');
            navigate('/dashboard/orders');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Add Logo
        if (logoData) {
            doc.addImage(logoData, 'PNG', 15, 10, 25, 25);
        }

        // Business Name next to logo
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(profile?.full_name || 'KRIDO BAHTIAR', 45, 18);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (profile?.phone) {
            doc.text(`Telp: ${profile.phone}`, 45, 25);
        }

        // INVOICE Title (Right Side)
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 190, 20, { align: 'right' });

        // Invoice Number below INVOICE title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(order.invoice_number, 190, 28, { align: 'right' });

        // Divider
        doc.setDrawColor(249, 115, 22);
        doc.setLineWidth(0.8);
        doc.line(15, 40, 195, 40);

        // Invoice Details Row
        doc.setFontSize(10);
        doc.text(`Tanggal: ${formatDate(order.created_at)}`, 15, 50);

        // Status with color
        const statusText = order.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS';
        if (order.status === 'paid') {
            doc.setTextColor(34, 197, 94); // green
        } else {
            doc.setTextColor(234, 179, 8); // yellow
        }
        doc.setFont('helvetica', 'bold');
        doc.text(`Status: ${statusText}`, 195, 50, { align: 'right' });
        doc.setTextColor(0); // reset to black

        // Customer Info
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Kepada:', 15, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_name, 15, 67);
        if (order.customer_phone) {
            doc.text(`Telp: ${order.customer_phone}`, 15, 74);
        }
        if (order.customer_email) {
            doc.text(`Email: ${order.customer_email}`, 15, 81);
        }
        if (order.customer_address) {
            const addressLines = doc.splitTextToSize(order.customer_address, 80);
            doc.text(addressLines, 15, 88);
        }

        // Table Header
        const tableTop = 100;
        doc.setFillColor(249, 115, 22);
        doc.rect(15, tableTop, 180, 10, 'F');
        doc.setTextColor(255);
        doc.setFont('helvetica', 'bold');
        doc.text('Deskripsi', 25, tableTop + 7);
        doc.text('Qty', 110, tableTop + 7);
        doc.text('Harga', 130, tableTop + 7);
        doc.text('Total', 165, tableTop + 7);

        // Table Row
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        const rowY = tableTop + 17;
        doc.text(order.service_name, 25, rowY);
        doc.text(String(order.quantity), 110, rowY);
        doc.text(formatCurrency(order.service_price), 130, rowY);
        doc.text(formatCurrency(order.service_price * order.quantity), 165, rowY);

        // Summary
        const summaryTop = rowY + 20;
        doc.line(120, summaryTop - 5, 190, summaryTop - 5);

        doc.text('Subtotal:', 130, summaryTop + 5);
        doc.text(formatCurrency(order.service_price * order.quantity), 190, summaryTop + 5, { align: 'right' });

        if (order.discount > 0) {
            doc.text('Diskon:', 130, summaryTop + 12);
            doc.text(`- ${formatCurrency(order.discount)}`, 190, summaryTop + 12, { align: 'right' });
        }

        if (order.tax_percent > 0) {
            const taxAmount = ((order.service_price * order.quantity - order.discount) * order.tax_percent) / 100;
            doc.text(`Pajak (${order.tax_percent}%):`, 130, summaryTop + 19);
            doc.text(formatCurrency(taxAmount), 190, summaryTop + 19, { align: 'right' });
        }

        // Total
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const totalY = summaryTop + (order.discount > 0 ? 30 : 20) + (order.tax_percent > 0 ? 7 : 0);
        doc.line(120, totalY - 3, 190, totalY - 3);
        doc.text('TOTAL:', 130, totalY + 5);
        doc.text(formatCurrency(order.total_amount), 190, totalY + 5, { align: 'right' });

        // Notes
        if (order.notes) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Catatan:', 20, totalY + 25);
            doc.setFont('helvetica', 'normal');
            const noteLines = doc.splitTextToSize(order.notes, 170);
            doc.text(noteLines, 20, totalY + 32);
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(128);
        doc.text('Terima kasih atas kepercayaan Anda!', 105, 280, { align: 'center' });

        // Save
        doc.save(`${order.invoice_number}.pdf`);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-400">Memuat invoice...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-400">Order tidak ditemukan</p>
            </div>
        );
    }

    const subtotal = order.service_price * order.quantity;
    const afterDiscount = subtotal - order.discount;
    const taxAmount = (afterDiscount * order.tax_percent) / 100;

    return (
        <div className="p-8">
            {/* Action Bar - Hidden on Print */}
            <div className="print:hidden flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="mr-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Preview Invoice</h1>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice Preview */}
            <div
                ref={invoiceRef}
                className="max-w-3xl mx-auto bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-16 h-16 rounded-full mr-4 bg-white p-1"
                            />
                            <div>
                                <h1 className="text-3xl font-bold">INVOICE</h1>
                                <p className="text-orange-100 mt-1">{order.invoice_number}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">{profile?.full_name || 'KRIDO BAHTIAR'}</p>
                            {profile?.phone && <p className="text-orange-100">Telp: {profile.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-8 py-6">
                    {/* Invoice Meta & Customer */}
                    <div className="flex justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Kepada</h3>
                            <p className="font-bold text-lg">{order.customer_name}</p>
                            {order.customer_phone && <p className="text-gray-600">{order.customer_phone}</p>}
                            {order.customer_email && <p className="text-gray-600">{order.customer_email}</p>}
                            {order.customer_address && <p className="text-gray-600 max-w-xs">{order.customer_address}</p>}
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-sm text-gray-500">Tanggal:</span>
                                <p className="font-medium">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-500">Status:</span>
                                <p className={`font-bold ${order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 font-bold text-gray-700">Deskripsi</th>
                                <th className="text-center py-3 font-bold text-gray-700 w-20">Qty</th>
                                <th className="text-right py-3 font-bold text-gray-700 w-32">Harga</th>
                                <th className="text-right py-3 font-bold text-gray-700 w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-4">{order.service_name}</td>
                                <td className="py-4 text-center">{order.quantity}</td>
                                <td className="py-4 text-right">{formatCurrency(order.service_price)}</td>
                                <td className="py-4 text-right">{formatCurrency(subtotal)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between py-2 text-red-600">
                                    <span>Diskon</span>
                                    <span>- {formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            {order.tax_percent > 0 && (
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-600">Pajak ({order.tax_percent}%)</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-t-2 border-gray-900 mt-2">
                                <span className="font-bold text-lg">TOTAL</span>
                                <span className="font-bold text-lg text-orange-600">{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-gray-700 mb-2">Catatan:</h3>
                            <p className="text-gray-600">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-500">
                    Terima kasih atas kepercayaan Anda!
                </div>
            </div>
        </div>
    );
};

export default InvoicePrint;
