import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Upload, FileText, BarChart, Save, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const ExportToolbar = ({ onToggleChart }) => {
  const { nodes, threadOrder, subplots, exportProject, loadProject, clearProject } = useProject();
  const fileInputRef = useRef(null);

  const getOrderedNodes = () => threadOrder.map(id => nodes.find(n => n.id === id)).filter(Boolean);

  const handleClearProject = () => {
    if (window.confirm("Are you sure you want to clear the entire project? This action cannot be undone.")) {
      clearProject();
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const ordered = getOrderedNodes();

    doc.setFontSize(20);
    doc.text("Novel Plot Outline", 14, 22);

    const tableData = ordered.map((node, index) => {
      const subplot = subplots.find(s => s.id === node.subplotId);
      const notes = node.notes ? node.notes.map(n => n.text).join('; ') : '';
      return [
        index + 1,
        subplot ? subplot.name : 'Unknown',
        node.text,
        node.intensity,
        notes
      ];
    });

    autoTable(doc, {
      head: [['#', 'Subplot', 'Scene Description', 'Intensity', 'Notes']],
      body: tableData,
      startY: 30,
      columnStyles: {
        2: { cellWidth: 60 },
        4: { cellWidth: 'auto' }
      }
    });

    doc.save('plot_outline.pdf');
  };

  const handleExportCSV = () => {
    const ordered = getOrderedNodes();
    const headers = ['Order,Subplot,Description,Intensity,Notes'];
    const rows = ordered.map((node, index) => {
      const subplot = subplots.find(s => s.id === node.subplotId);
      // Escape quotes in description and notes
      const desc = `"${node.text.replace(/"/g, '""')}"`;
      const notes = node.notes ? `"${node.notes.map(n => n.text.replace(/"/g, '""')).join('; ')}"` : '""';
      return `${index + 1},${subplot ? subplot.name : 'Unknown'},${desc},${node.intensity},${notes}`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plot_outline.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveProject = () => {
    const json = exportProject();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "story-project.json";
    link.click();
  };

  const handleLoadProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        loadProject(data);
      } catch (err) {
        alert("Failed to parse project file");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = null;
  };

  return (
    <div className="flex text-sm justify-between items-center px-2 py-0 bg-slate-900 border-b border-slate-600 gap-4">
      <div className="flex gap-2">
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-sky-400 hover:text-sky-400 hover:-translate-y-px active:translate-y-0"
          onClick={onToggleChart}
          title="Show Intensity Chart"
        >
          <BarChart size={12} /> Chart
        </button>
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-sky-400 hover:text-sky-400 hover:-translate-y-px active:translate-y-0"
          onClick={handleExportPDF}
          title="Export PDF"
        >
          <FileText size={12} /> PDF
        </button>
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-sky-400 hover:text-sky-400 hover:-translate-y-px active:translate-y-0"
          onClick={handleExportCSV}
          title="Export CSV"
        >
          <Download size={12} /> CSV
        </button>
      </div>

      <div className="flex gap-2">
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-red-400 hover:text-red-400 hover:-translate-y-px active:translate-y-0"
          onClick={handleClearProject}
          title="Clear Project"
        >
          <Trash2 size={12} /> Clear
        </button>
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-sky-400 hover:text-sky-400 hover:-translate-y-px active:translate-y-0"
          onClick={handleSaveProject}
          title="Save Project JSON"
        >
          <Save size={12} /> Save
        </button>
        <button
          className="flex items-center gap-2 px-2 py-1 text-slate-50 transition-all hover:bg-slate-600 hover:border-sky-400 hover:text-sky-400 hover:-translate-y-px active:translate-y-0"
          onClick={() => fileInputRef.current.click()}
          title="Load Project JSON"
        >
          <Upload size={12} /> Load
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={handleLoadProject}
        />
      </div>
    </div>
  );
};

export default ExportToolbar;
