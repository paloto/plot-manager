import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
    // Load initial state from local storage or use defaults
    const [subplots, setSubplots] = useState(() => {
        const saved = localStorage.getItem('storybuilder_subplots');
        return saved ? JSON.parse(saved) : [{ id: 'sub-1', name: 'Main Plot', color: '#38bdf8' }];
    });

    const [nodes, setNodes] = useState(() => {
        const saved = localStorage.getItem('storybuilder_nodes');
        return saved ? JSON.parse(saved) : [];
    });

    const [threadOrder, setThreadOrder] = useState(() => {
        const saved = localStorage.getItem('storybuilder_threadOrder');
        return saved ? JSON.parse(saved) : [];
    });

    // Save to local storage whenever state changes
    useEffect(() => {
        localStorage.setItem('storybuilder_subplots', JSON.stringify(subplots));
    }, [subplots]);

    useEffect(() => {
        localStorage.setItem('storybuilder_nodes', JSON.stringify(nodes));
    }, [nodes]);

    useEffect(() => {
        localStorage.setItem('storybuilder_threadOrder', JSON.stringify(threadOrder));
    }, [threadOrder]);

    const addSubplot = (name, color) => {
        const newSubplot = {
            id: crypto.randomUUID(),
            name,
            color
        };
        setSubplots([...subplots, newSubplot]);
    };

    const removeSubplot = (id) => {
        setSubplots(subplots.filter(s => s.id !== id));
        // Also remove nodes associated? Or keep them as orphans? remove for now.
        const nodesToRemove = nodes.filter(n => n.subplotId === id);
        const idsToRemove = new Set(nodesToRemove.map(n => n.id));
        setNodes(nodes.filter(n => n.subplotId !== id));
        setThreadOrder(threadOrder.filter(tid => !idsToRemove.has(tid)));
    };

    const addNode = (subplotId, text = 'New Scene', intensity = 5) => {
        const newNode = {
            id: crypto.randomUUID(),
            subplotId,
            text,
            intensity
        };
        setNodes([...nodes, newNode]);
    };

    const updateNode = (id, updates) => {
        setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
    };

    const removeNode = (id) => {
        setNodes(nodes.filter(n => n.id !== id));
        setThreadOrder(threadOrder.filter(tid => tid !== id));
    };

    const addToThread = (nodeId) => {
        if (!threadOrder.includes(nodeId)) {
            setThreadOrder([...threadOrder, nodeId]);
        }
    };

    const removeFromThread = (nodeId) => {
        setThreadOrder(threadOrder.filter(id => id !== nodeId));
    };

    const reorderThread = (newOrder) => {
        setThreadOrder(newOrder);
    };

    const loadProject = (data) => {
        if (data.subplots) setSubplots(data.subplots);
        if (data.nodes) setNodes(data.nodes);
        if (data.threadOrder) setThreadOrder(data.threadOrder);
    };

    const exportProject = () => {
        return JSON.stringify({ subplots, nodes, threadOrder }, null, 2);
    };

    const clearProject = () => {
        setSubplots([{ id: 'sub-1', name: 'Main Plot', color: '#38bdf8' }]);
        setNodes([]);
        setThreadOrder([]);
        localStorage.removeItem('storybuilder_subplots');
        localStorage.removeItem('storybuilder_nodes');
        localStorage.removeItem('storybuilder_threadOrder');
    };

    return (
        <ProjectContext.Provider value={{
            subplots,
            nodes,
            threadOrder,
            addSubplot,
            removeSubplot,
            addNode,
            updateNode,
            removeNode,
            addToThread,
            removeFromThread,
            reorderThread,
            loadProject,
            exportProject,
            clearProject
        }}>
            {children}
        </ProjectContext.Provider>
    );
};
