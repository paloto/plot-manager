import React, { useState, useRef, useEffect } from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import ThreadTimeline from './components/ThreadTimeline';
import ChartModal from './components/ChartModal';
import ExportToolbar from './components/ExportToolbar';
import SubplotColumn from './components/SubplotColumn';
import { Plus, ChevronLeft } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import SortableNode from './components/SortableNode';

const BoardLayout = () => {
  const { subplots, addSubplot, threadOrder, reorderThread, addToThread, nodes, updateNode } = useProject();
  const [showChart, setShowChart] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubplotName, setNewSubplotName] = useState('');
  const [newSubplotColor, setNewSubplotColor] = useState('#38bdf8');
  const [activeId, setActiveId] = useState(null);

  // Resize / Collapse state
  const [timelineWidth, setTimelineWidth] = useState(400);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const startResizing = React.useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection
  }, []);

  const stopResizing = React.useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = React.useCallback((e) => {
    if (isResizing.current) {
      // Calculate new width based on mouse position from right edge of screen
      // Timeline is on the right, so width = windowWidth - mouseX
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 250 && newWidth < 800) { // Min/Max constraints
        setTimelineWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);


  const handleCreateSubplot = (e) => {
    e.preventDefault();
    if (!newSubplotName.trim()) return;
    addSubplot(newSubplotName, newSubplotColor);
    setNewSubplotName('');
    setIsCreating(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Distinguish between dragging a subplot node (has prefix) and a thread node (no prefix)
    const isSubplotNode = activeId.toString().startsWith('subplot-node-');
    const realActiveId = isSubplotNode ? activeId.replace('subplot-node-', '') : activeId;

    // Target is the Thread Timeline
    const isOverThread = threadOrder.includes(overId) || overId === 'thread-timeline-container';

    if (isOverThread) {
      // If dropped over a collapsed timeline (unlikely valid drop target visually, but logic safe)
      if (isCollapsed) return;

      // Calculate new index
      let newIndex = threadOrder.length;
      if (overId !== 'thread-timeline-container') {
        // If dropping over a specific node, determine if we are dropping before or after
        // simple approach: insert at index of overId
        newIndex = threadOrder.indexOf(overId);
      }

      if (threadOrder.includes(realActiveId)) {
        // Node is already in thread: Reorder it
        const oldIndex = threadOrder.indexOf(realActiveId);
        reorderThread(arrayMove(threadOrder, oldIndex, newIndex));
      } else {
        // Node is new to thread: Insert it
        const newOrder = [...threadOrder];
        // If dragging from outside, we usually want simple insertion
        newOrder.splice(newIndex, 0, realActiveId);
        reorderThread(newOrder);
      }
    }
  };

  const activeNode = activeId ? nodes.find(n => n.id === activeId || n.id === activeId.replace('subplot-node-', '')) : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-50 overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Toolbar stays at top */}
        <div className="flex-shrink-0 z-20 shadow-md">
          <ExportToolbar onToggleChart={() => setShowChart(true)} />
        </div>

        {/* Main Content Area - Split into Scrollable Subplots and Fixed Thread */}
        <div className="flex-1 flex overflow-hidden">

          {/* Scrollable Subplots Area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 items-start custom-scrollbar">
            {/* Render Subplot Columns */}
            {subplots.map(subplot => (
              <SubplotColumn key={subplot.id} subplot={subplot} />
            ))}

            {/* 'New Subplot' Column / Button */}
            <div className="flex flex-col w-80 h-full flex-shrink-0">
              {isCreating ? (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-semibold text-slate-200 mb-4">New Subplot</h3>
                  <form onSubmit={handleCreateSubplot} className="flex flex-col gap-4">
                    <input
                      autoFocus
                      className="bg-slate-900 border border-slate-600 rounded p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                      placeholder="Subplot Name..."
                      value={newSubplotName}
                      onChange={(e) => setNewSubplotName(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-400">Color:</label>
                      <input
                        type="color"
                        className="bg-transparent border-none w-10 h-8 cursor-pointer"
                        value={newSubplotColor}
                        onChange={(e) => setNewSubplotColor(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-sky-600 hover:bg-sky-500 text-white rounded py-2 font-medium transition-colors"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded py-2 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="h-16 border-2 border-dashed border-slate-700 hover:border-sky-500/50 hover:bg-slate-800/50 rounded-lg flex items-center justify-center gap-2 text-slate-500 hover:text-sky-400 transition-all group"
                >
                  <div className="p-1 rounded-full bg-slate-800 group-hover:bg-sky-500/20 transition-colors">
                    <Plus size={20} />
                  </div>
                  <span className="font-medium">Add Subplot</span>
                </button>
              )}
            </div>
          </div>

          {/* Resizable Common Thread Column */}
          {isCollapsed ? (
            // Collapsed State
            <div className="h-full border-l border-slate-800 bg-slate-900 w-12 flex flex-col items-center py-4 flex-shrink-0 z-10 transition-all">
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Expand Timeline"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="mt-8 [writing-mode:vertical-rl] rotate-180 text-slate-500 font-bold tracking-wider uppercase text-xs">
                Common Timeline
              </div>
            </div>
          ) : (
            // Expanded State
            <div className="flex h-full z-10 flex-shrink-0" style={{ width: timelineWidth }}>
              {/* Resize Handle */}
              <div
                className="w-1 cursor-col-resize hover:bg-sky-500 active:bg-sky-600 transition-colors bg-slate-800 z-20 flex-shrink-0"
                onMouseDown={startResizing}
              />

              {/* Content */}
              <div className="flex-1 h-full border-l border-slate-800 shadow-xl overflow-hidden">
                <ThreadTimeline onCollapse={() => setIsCollapsed(true)} />
              </div>
            </div>
          )}
        </div>

        <DragOverlay>
          {activeNode ? (
            <div className="opacity-90 rotate-2 cursor-grabbing scale-105 pointer-events-none">
              {/* Render a purely visual SortableNode (not connected to logic) */}
              <SortableNode node={activeNode} />
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>
      {showChart && <ChartModal onClose={() => setShowChart(false)} />}
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <BoardLayout />
    </ProjectProvider>
  );
}

export default App;
