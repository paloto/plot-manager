import React, { useState } from 'react';
import { X, Plus, Trash2, StickyNote } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const NotesModal = ({ node, onClose }) => {
    const { updateNode } = useProject();
    const [newNote, setNewNote] = useState('');

    const notes = node.notes || [];

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        const updatedNotes = [...notes, { id: crypto.randomUUID(), text: newNote, createdAt: new Date().toISOString() }];
        updateNode(node.id, { notes: updatedNotes });
        setNewNote('');
    };

    const handleDeleteNote = (noteId) => {
        const updatedNotes = notes.filter(n => n.id !== noteId);
        updateNode(node.id, { notes: updatedNotes });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-md rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex justify-between items-start p-4 border-b border-slate-800">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                            <StickyNote size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-100">Scene Notes</h2>
                            <p className="text-sm text-slate-400 truncate max-w-[200px]">{node.text || 'Untitled Scene'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {notes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 italic">
                            No notes yet. Add one below.
                        </div>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="bg-slate-800 p-3 rounded border border-slate-700/50 flex justify-between items-start gap-3 group">
                                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{note.text}</p>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    title="Delete Note"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer (Input) */}
                <form onSubmit={handleAddNote} className="p-4 border-t border-slate-800 bg-slate-900/50 rounded-b-xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Type a note..."
                            className="flex-1 bg-slate-800 border-slate-700 border rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newNote.trim()}
                            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NotesModal;
