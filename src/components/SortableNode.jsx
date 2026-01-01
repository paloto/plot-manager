import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, MessageSquare } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

const SortableNode = ({ node, onOpenNotes }) => {
  const { subplots, updateNode, removeFromThread } = useProject();
  const subplot = subplots.find(s => s.id === node.subplotId) || { color: '#ccc' };
  const notesCount = node.notes ? node.notes.length : 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `5px solid ${subplot.color}`,
    marginBottom: '0.5rem',
  };

  const textareaRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [node.text]);

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-800 rounded p-1.5 flex items-start gap-1.5 relative shadow-sm hover:shadow-md transition-shadow group">
      <div className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-slate-300 mt-1" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex gap-1.5">
          <textarea
            ref={textareaRef}
            className="bg-transparent border-none text-slate-200 flex-1 text-sm focus:outline-none placeholder:text-slate-500 w-full resize-none overflow-hidden leading-snug"
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

        <div className="flex justify-between items-center gap-2 mt-0.5 text-xs">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 bg-slate-900/50 rounded px-1 py-0.5">
              <span className="text-slate-500 uppercase tracking-wider text-[9px]">Int</span>
              <input
                type="number"
                min="1"
                max="10"
                className="w-12 h-5 bg-transparent text-center text-slate-300 focus:outline-none text-[10px]"
                value={node.intensity}
                onChange={(e) => updateNode(node.id, { intensity: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Notes Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOpenNotes();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`flex items-center gap-1 px-1 py-0.5 rounded transition-colors ${notesCount > 0 ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'}`}
              title="View Notes"
            >
              <MessageSquare size={12} />
              {notesCount > 0 && <span className="font-medium text-[10px]">{notesCount}</span>}
            </button>
          </div>

          <span
            className="px-1 py-0.5 rounded font-medium text-[10px]"
            style={{ backgroundColor: `${subplot.color}20`, color: subplot.color }}
          >
            {subplot.name || 'Unknown'}
          </span>
        </div>
      </div>

      <button onClick={() => removeFromThread(node.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
        <X size={14} />
      </button>
    </div>
  );
};

export default SortableNode;
