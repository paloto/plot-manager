import React from 'react';
import { X } from 'lucide-react';
import IntensityChart from './IntensityChart';

const ChartModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Story Intensity Analysis</h2>
                    <button onClick={onClose} className="close-btn"><X size={24} /></button>
                </div>
                <div className="modal-body">
                    <IntensityChart />
                </div>
            </div>
            <style>{`
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
        }
        .modal-content {
            background: var(--bg-card);
            width: 90%;
            max-width: 900px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
        }
        .modal-header {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .close-btn {
            background: transparent;
            color: var(--text-secondary);
        }
        .close-btn:hover {
            color: var(--text-primary);
        }
        .modal-body {
            padding: 1rem;
            height: 400px;
        }
      `}</style>
        </div>
    );
};

export default ChartModal;
