import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
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
    const [qrData, setQrData] = useState(null);

    // Load assets for PDF
    useEffect(() => {
        const loadAssets = async () => {
            try {
                // Load SVG Logo and convert to PNG for jsPDF
                const svgRes = await fetch('/favicon.svg');
                const svgText = await svgRes.text();
                const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 512;
                    canvas.height = 512;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, 512, 512);
                    setLogoData(canvas.toDataURL('image/png'));
                    URL.revokeObjectURL(svgUrl);
                };
                img.src = svgUrl;

                // Load QR Code using QR Server API
                const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://nineteen-dev.vercel.app/&margin=0';
                const qrRes = await fetch(qrUrl);
                const qrBlob = await qrRes.blob();
                const qrReader = new FileReader();
                qrReader.onloadend = () => setQrData(qrReader.result);
                qrReader.readAsDataURL(qrBlob);
            } catch (error) {
                console.error('Error loading PDF assets:', error);
            }
        };
        loadAssets();
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

        // Setup Watermark
        if (logoData) {
            try {
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.05 }));
                // Center watermark
                doc.addImage(logoData, 'PNG', 55, 120, 100, 100);
                doc.restoreGraphicsState();
            } catch (e) {
                // Ignore if GState not supported
            }
        }

        // Add Logo
        if (logoData) {
            doc.addImage(logoData, 'PNG', 15, 10, 20, 20);
        }

        // Business Name next to logo
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(profile?.full_name || 'nineteen.dev', 42, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        if (profile?.phone) {
            doc.text(`Telp: ${profile.phone}`, 42, 29);
        }

        // INVOICE Title (Right Side)
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); // Primary blue
        doc.text('INVOICE', 195, 22, { align: 'right' });

        // Invoice Number
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(order.invoice_number, 195, 30, { align: 'right' });

        // Blue Divider
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(0.8);
        doc.line(15, 40, 195, 40);

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Left Section: Customer
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Kepada:', 15, 52);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(order.customer_name, 15, 59);
        
        let custY = 66;
        if (order.customer_phone) {
            doc.text(`Telp: ${order.customer_phone}`, 15, custY);
            custY += 7;
        }
        if (order.customer_email) {
            doc.text(`Email: ${order.customer_email}`, 15, custY);
            custY += 7;
        }
        if (order.customer_address) {
            const addressLines = doc.splitTextToSize(order.customer_address, 80);
            doc.text(addressLines, 15, custY);
        }

        // Right Section: Dates and Status
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal:', 195, 52, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(formatDate(order.created_at), 195, 59, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.text('Status:', 195, 69, { align: 'right' });
        
        // Badge Rendering
        const statusText = order.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS';
        if (order.status === 'paid') {
            doc.setFillColor(220, 252, 231); // green-100
            doc.setTextColor(22, 163, 74); // green-600
        } else {
            doc.setFillColor(254, 240, 138); // yellow-200
            doc.setTextColor(202, 138, 4); // yellow-600
        }
        const badgeWidth = order.status === 'paid' ? 25 : 35;
        doc.roundedRect(195 - badgeWidth, 72, badgeWidth, 7, 1.5, 1.5, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(statusText, 195 - (badgeWidth / 2), 77, { align: 'center' });

        // Table Header
        const tableTop = 100;
        doc.setFillColor(59, 130, 246);
        doc.rect(15, tableTop, 180, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Deskripsi', 25, tableTop + 7);
        doc.text('Qty', 120, tableTop + 7, { align: 'center' });
        doc.text('Harga', 160, tableTop + 7, { align: 'right' });
        doc.text('Total', 190, tableTop + 7, { align: 'right' });

        // Table Row (Dynamic length could be added loops later, but treating as single row for now)
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        const rowY = tableTop + 17;
        doc.text(order.service_name, 25, rowY);
        doc.text(String(order.quantity), 120, rowY, { align: 'center' });
        doc.text(formatCurrency(order.service_price), 160, rowY, { align: 'right' });
        doc.text(formatCurrency(order.service_price * order.quantity), 190, rowY, { align: 'right' });

        // Reset divider color for summaries
        doc.setDrawColor(229, 231, 235); // gray-200
        doc.setLineWidth(0.5);

        // Summary Calculations Area
        const summaryTop = rowY + 20;
        doc.line(125, summaryTop - 5, 195, summaryTop - 5);

        doc.text('Subtotal:', 160, summaryTop + 5, { align: 'right' });
        doc.text(formatCurrency(order.service_price * order.quantity), 190, summaryTop + 5, { align: 'right' });

        let currentYOffset = 12;
        if (order.discount > 0) {
            doc.text('Diskon:', 160, summaryTop + currentYOffset, { align: 'right' });
            doc.setTextColor(239, 68, 68); // red text for discount
            doc.text(`- ${formatCurrency(order.discount)}`, 190, summaryTop + currentYOffset, { align: 'right' });
            doc.setTextColor(0, 0, 0);
            currentYOffset += 7;
        }

        if (order.tax_percent > 0) {
            const taxAmount = ((order.service_price * order.quantity - order.discount) * order.tax_percent) / 100;
            doc.text(`Pajak (${order.tax_percent}%):`, 160, summaryTop + currentYOffset, { align: 'right' });
            doc.text(formatCurrency(taxAmount), 190, summaryTop + currentYOffset, { align: 'right' });
            currentYOffset += 7;
        }

        // Grand Total Line
        doc.line(125, summaryTop + currentYOffset - 2, 195, summaryTop + currentYOffset - 2);
        
        const totalY = summaryTop + currentYOffset + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TOTAL:', 160, totalY, { align: 'right' });
        doc.setTextColor(59, 130, 246); // blue theme for final total numbers
        doc.text(formatCurrency(order.total_amount), 190, totalY, { align: 'right' });

        // Area Catatan
        if (order.notes) {
            doc.setTextColor(0, 0, 0);
            doc.setFillColor(249, 250, 251); // Sangat tipis gray-50
            doc.setDrawColor(243, 244, 246); // Border tipis abu
            doc.roundedRect(15, totalY + 15, 180, 25, 2, 2, 'FD'); // Fill & Draw Boundary
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Catatan:', 20, totalY + 22);
            doc.setFont('helvetica', 'normal');
            const noteLines = doc.splitTextToSize(order.notes, 170);
            doc.text(noteLines, 20, totalY + 29);
        }

        // Add QR Code
        if (qrData) {
            doc.addImage(qrData, 'PNG', 170, 245, 25, 25);
            doc.setFontSize(7);
            doc.setTextColor(128, 128, 128);
            doc.text('Scan Website', 182.5, 274, { align: 'center' });
        }

        // Footer Text
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('Invoice ini digenerate secara otomatis oleh nineteen.dev', 105, 280, { align: 'center' });

        // Save
        doc.save(`${order.invoice_number}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="inline-block w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Memuat invoice...</p>
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
        <div>
            {/* Action Bar - Hidden on Print */}
            <div className="print:hidden flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="p-2 text-gray-400 hover:text-foreground hover:bg-white rounded-md transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Preview Invoice</h1>
                        <p className="text-sm text-gray-400 font-medium mt-0.5">{order?.invoice_number}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="btn-secondary gap-2 text-sm"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="btn-primary gap-2 text-sm"
                    >
                        <Download className="w-4 h-4" />
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
                <div className="bg-primary px-8 py-6 text-white">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-primary font-black text-lg leading-none">19</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight">INVOICE</h1>
                                <p className="text-blue-200 text-sm mt-0.5">{order.invoice_number}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-extrabold text-lg">{profile?.full_name || 'nineteen.dev'}</p>
                            {profile?.phone && <p className="text-blue-200 text-sm">Telp: {profile.phone}</p>}
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
                            <div className="flex justify-between py-3 border-t-2 border-foreground mt-2">
                                <span className="font-bold text-lg">TOTAL</span>
                                <span className="font-bold text-lg text-primary">{formatCurrency(order.total_amount)}</span>
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
