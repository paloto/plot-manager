import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, Check, MessageSquare, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useProject } from '../context/ProjectContext';
import NotesModal from './NotesModal';

const DraggableSubplotNode = ({ node, children, disabled }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `subplot-node-${node.id}`,
        data: {
            node
        },
        disabled: disabled
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            {/* Handle is inside children, but attributes/listeners need to be attached to handle */}
            {React.cloneElement(children, { dragHandleProps: disabled ? {} : { ...attributes, ...listeners } })}
        </div>
    );
};

const SubplotColumn = ({ subplot }) => {
    const { nodes, threadOrder, addNode, removeSubplot, updateNode, removeNode, addToThread } = useProject();
    const [activeNodeId, setActiveNodeId] = useState(null);

    const subplotNodes = nodes.filter(n => n.subplotId === subplot.id);
    const activeNode = nodes.find(n => n.id === activeNodeId);

    return (
        <div className="flex flex-col w-80 bg-slate-800 rounded-lg border border-slate-700 h-full flex-shrink-0 relative">
            {/* Header */}
            <div
                className="p-3 border-b border-slate-700 flex justify-between items-center rounded-t-lg"
                style={{ borderTop: `4px solid ${subplot.color}` }}
            >
                <h3 className="font-semibold text-slate-200 truncate pr-2">{subplot.name}</h3>
                <button
                    onClick={() => removeSubplot(subplot.id)}
                    className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                    title="Delete Subplot"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Nodes List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
                {subplotNodes.map(node => {
                    const inThread = threadOrder.includes(node.id);
                    const notesCount = node.notes ? node.notes.length : 0;

                    return (
                        <DraggableSubplotNode key={node.id} node={node} disabled={inThread}>
                            <SubplotNodeContent
                                node={node}
                                inThread={inThread}
                                notesCount={notesCount}
                                updateNode={updateNode}
                                setActiveNodeId={setActiveNodeId}
                                addToThread={addToThread}
                                removeNode={removeNode}
                            />
                        </DraggableSubplotNode>
                    );
                })}
            </div>

            {/* Footer / Add Node */}
            <div className="p-3 border-t border-slate-700 bg-slate-800/50 rounded-b-lg">
                <button
                    className="w-full py-2 flex items-center justify-center gap-2 rounded text-sm font-medium transition-all hover:brightness-110 active:scale-[0.98]"
                    onClick={() => addNode(subplot.id, '', 5)}
                    style={{ backgroundColor: `${subplot.color}20`, color: subplot.color }}
                >
                    <Plus size={16} /> Add Scene
                </button>
            </div>

            {activeNode && <NotesModal node={activeNode} onClose={() => setActiveNodeId(null)} />}
        </div>
    );
};

// Extracted for cleaner rendering with drag props
const SubplotNodeContent = ({ node, inThread, notesCount, updateNode, setActiveNodeId, addToThread, removeNode, dragHandleProps }) => {
    return (
        <div className={`bg-slate-700/50 p-2 rounded border flex flex-col gap-1.5 group transition-colors ${inThread ? 'border-emerald-500/30 opacity-75' : 'border-slate-600/50 hover:border-slate-500'}`}>
            <div className="flex gap-1.5 items-start">
                <div
                    className={`mt-0.5 transition-colors ${inThread ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300'}`}
                    {...dragHandleProps}
                    title={inThread ? "Added to Thread" : "Drag to Thread"}
                >
                    <GripVertical size={16} />
                </div>
                <textarea
                    className="bg-transparent border-none text-slate-200 flex-1 text-sm focus:outline-none placeholder:text-slate-500 resize-none h-auto overflow-hidden min-h-[1.25rem] leading-snug"
                    value={node.text}
                    onChange={(e) => updateNode(node.id, { text: e.target.value })}
                    placeholder="Scene description..."
                    rows={1}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                />
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-slate-600/30">
                <div className="flex items-center gap-2">
                    {/* Intensity */}
                    <div className="flex items-center gap-1 bg-slate-800/50 rounded px-1 py-0.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Int</span>
                        <input
                            type="number"
                            min="0"
                            max="10"
                            className="w-12 h-5 bg-transparent text-center text-[10px] text-slate-300 focus:outline-none"
                            value={node.intensity}
                            onChange={(e) => updateNode(node.id, { intensity: parseInt(e.target.value) || 0 })}
                        />
                    </div>

                    {/* Notes Button */}
                    <button
                        onClick={() => setActiveNodeId(node.id)}
                        className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors ${notesCount > 0 ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                        title="View Notes"
                    >
                        <MessageSquare size={12} />
                        {notesCount > 0 && <span className="text-[10px] font-medium">{notesCount}</span>}
                    </button>
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {inThread ? (
                        <span className="text-emerald-400 p-0.5" title="Already in Thread"><Check size={12} /></span>
                    ) : (
                        <button
                            className="p-0.5 hover:bg-sky-500/20 hover:text-sky-400 rounded text-slate-400 transition-colors"
                            onClick={() => addToThread(node.id)}
                            title="Add to Main Thread"
                        >
                            <ArrowRight size={12} />
                        </button>
                    )}
                    <button
                        className="p-0.5 hover:bg-red-500/20 hover:text-red-400 rounded text-slate-400 transition-colors"
                        onClick={() => removeNode(node.id)}
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubplotColumn;
