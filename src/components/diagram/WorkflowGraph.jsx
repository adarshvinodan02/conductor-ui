import React, { useCallback, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  Position,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import AddTaskDialog from "./AddTaskDialog";
import EditTaskDialog from "./EditTaskDialog";

const initialNodes = [
  {
    id: "start",
    position: { x: 0, y: 0 },
    data: { label: "START", taskType: "SIMPLE" },
    type: "task",
  },
  {
    id: "switch",
    position: { x: 0, y: 150 },
    data: { label: "SWITCH", taskType: "SWITCH" },
    type: "switch",
  },
];

const initialEdges = [{ id: "e1", source: "start", target: "switch" }];

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 150;
const nodeHeight = 60;

function layout(nodes, edges) {
  dagreGraph.setGraph({ rankdir: "TB" });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return { ...node, position: { x: pos.x, y: pos.y } };
  });
}

const TaskNode = ({ id, data }) => (
  <div className="bg-blue-100 p-2 rounded border text-center text-xs">
    <Handle type="target" position={Position.Top} />
    <div onClick={() => data.onEdit(id)} className="cursor-pointer">
      {data.label}
    </div>
    <div className="space-x-1 mt-1">
      <button
        onClick={() => data.onAdd(id)}
        className="px-1 bg-yellow-200 rounded-full"
      >
        +
      </button>
      <button
        onClick={() => data.onRemove(id)}
        className="px-1 bg-red-200 rounded-full"
      >
        -
      </button>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const SwitchNode = ({ id, data }) => (
  <div className="bg-yellow-100 p-2 rounded border text-center text-xs">
    <Handle type="target" position={Position.Top} />
    <div onClick={() => data.onEdit(id)} className="cursor-pointer">
      {data.label}
    </div>
    <div className="flex justify-center space-x-1 mt-1">
      {["case1", "case2", "default"].map((c) => (
        <button
          key={c}
          onClick={() => data.onAddBranch(id, c)}
          className="px-1 bg-yellow-200 rounded-full"
        >
          +{c}
        </button>
      ))}
      <button
        onClick={() => data.onRemove(id)}
        className="px-1 bg-red-200 rounded-full"
      >
        -
      </button>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { task: TaskNode, switch: SwitchNode };

export default function WorkflowGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [addTarget, setAddTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    setNodes((nds) => layout(nds, edges));
  }, [edges.length, nodes.length]);

  const addNode = useCallback(
    (parentId, { label, type: taskType }, caseName = null) => {
      const id = `n${Date.now()}`;
      const nodeType = taskType.toLowerCase() === "switch" ? "switch" : "task";
      const newNode = {
        id,
        type: nodeType,
        position: { x: 0, y: 0 },
        data: { label, taskType },
      };
      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) =>
        eds.concat({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          label: caseName || undefined,
        }),
      );
    },
    [setNodes, setEdges],
  );

  const removeNode = useCallback(
    (id) => {
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setNodes((nds) => nds.filter((n) => n.id !== id));
    },
    [setNodes, setEdges],
  );

  const openAdd = useCallback(
    (parentId, caseName = null) => setAddTarget({ parentId, caseName }),
    [],
  );
  const closeAdd = useCallback(() => setAddTarget(null), []);
  const openEdit = useCallback((id) => setEditTarget(id), []);
  const closeEdit = useCallback(() => setEditTarget(null), []);

  const handleAdd = useCallback(
    ({ label, type }) => {
      if (addTarget) {
        addNode(addTarget.parentId, { label, type }, addTarget.caseName);
      }
    },
    [addTarget, addNode],
  );

  const handleSave = useCallback(
    ({ id, label, taskType }) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, label, taskType } } : n,
        ),
      );
    },
    [setNodes],
  );

  const addSwitchBranch = useCallback(
    (switchId, caseName) => openAdd(switchId, caseName),
    [openAdd],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const enrichedNodes = nodes.map((n) =>
    n.type === "switch"
      ? {
          ...n,
          data: {
            ...n.data,
            onAddBranch: addSwitchBranch,
            onRemove: removeNode,
            onEdit: openEdit,
          },
        }
      : {
          ...n,
          data: {
            ...n.data,
            onAdd: openAdd,
            onRemove: removeNode,
            onEdit: openEdit,
          },
        },
  );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={(changes) =>
          setNodes((nds) => applyNodeChanges(changes, nds))
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds))
        }
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <AddTaskDialog open={!!addTarget} onClose={closeAdd} onAdd={handleAdd} />
      <EditTaskDialog
        open={!!editTarget}
        node={nodes.find((n) => n.id === editTarget)}
        onClose={closeEdit}
        onSave={handleSave}
      />
    </div>
  );
}
