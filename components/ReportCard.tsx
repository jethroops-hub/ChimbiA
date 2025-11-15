
import React from 'react';
import { VerificationStatus } from '../types';

interface ReportCardProps {
    title: string;
    status: VerificationStatus | string;
    notes: string;
    details?: string;
    icon: React.ReactNode;
}

const getStatusStyles = (status: VerificationStatus | string) => {
    switch (status) {
        case VerificationStatus.VERIFIED:
        case VerificationStatus.AUTHENTIC:
            return {
                bg: 'bg-green-500/10',
                text: 'text-green-400',
                border: 'border-green-500/20',
                labelBg: 'bg-green-500/20',
            };
        case VerificationStatus.SUSPICIOUS:
            return {
                bg: 'bg-yellow-500/10',
                text: 'text-yellow-400',
                border: 'border-yellow-500/20',
                labelBg: 'bg-yellow-500/20',
            };
        case VerificationStatus.NOT_FOUND:
        case VerificationStatus.UNABLE_TO_VERIFY:
            return {
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/20',
                labelBg: 'bg-red-500/20',
            };
        default:
            return {
                bg: 'bg-slate-700',
                text: 'text-slate-300',
                border: 'border-slate-600',
                labelBg: 'bg-slate-600',
            };
    }
};

const ReportCard: React.FC<ReportCardProps> = ({ title, status, notes, details, icon }) => {
    const styles = getStatusStyles(status);

    return (
        <div className={`p-4 rounded-lg border ${styles.border} ${styles.bg} transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles.labelBg} ${styles.text}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-lg text-white">{title}</h3>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles.labelBg} ${styles.text}`}>
                    {status.replace(/_/g, ' ')}
                </span>
            </div>
            {details && <p className="text-slate-300 font-mono bg-slate-900/50 p-2 rounded-md mb-2 text-sm">{details}</p>}
            <p className="text-slate-400 text-sm">{notes}</p>
        </div>
    );
};

export default ReportCard;
