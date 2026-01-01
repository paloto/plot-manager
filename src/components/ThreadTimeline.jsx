import React, { useState } from 'react';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronRight } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import SortableNode from './SortableNode';
import NotesModal from './NotesModal';

const ThreadTimeline = ({ onCollapse }) => {
    const { nodes, threadOrder } = useProject();
    const [activeNodeId, setActiveNodeId] = useState(null);

    // Filter nodes to ensure we only render what's in threadOrder
    const orderedNodes = threadOrder.map(id => nodes.find(n => n.id === id)).filter(Boolean);
    const activeNode = nodes.find(n => n.id === activeNodeId);

    return (
        <div className="flex flex-col w-full bg-slate-900 border-l border-slate-700 h-full flex-shrink-0 shadow-xl z-10 relative">
            <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        Common Thread
                        <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                            {orderedNodes.length} Scenes
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Drag and drop to reorder the master timeline.</p>
                </div>
                <button
                    onClick={onCollapse}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                    title="Collapse"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {/* SortableContext requires ids, matching threadOrder */}
                <SortableContext
                    items={threadOrder}
                    strategy={verticalListSortingStrategy}
                >
                    {/* Add a specific ID for the container to target empty drops */}
                    <div className="min-h-full" id="thread-timeline-container">
                        {orderedNodes.map(node => (
                            <SortableNode
                                key={node.id}
                                node={node}
                                onOpenNotes={() => setActiveNodeId(node.id)}
                            />
                        ))}
                        {orderedNodes.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 text-center p-6 bg-slate-800/20">
                                <p className="mb-2 font-medium">Timeline is Empty</p>
                                <p className="text-sm">Drag scenes here from your subplots to build the main story thread.</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </div>

            {activeNode && <NotesModal node={activeNode} onClose={() => setActiveNodeId(null)} />}
        </div>
    );
};

export default ThreadTimeline;
