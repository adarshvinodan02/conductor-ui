import React, { useCallback } from "react";
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

const initialNodes = [
  { id: "start", position: { x: 0, y: 0 }, data: { label: "START" }, type: "default" },
  {
    id: "switch",
    position: { x: 0, y: 150 },
    data: { label: "SWITCH" },
    type: "switch",
  },
];

const initialEdges = [{ id: "e1", source: "start", target: "switch" }];

const SwitchNode = ({ id, data }) => (
  <div className="bg-yellow-100 p-2 rounded border text-center">
    <Handle type="target" position={Position.Top} />
    <div>{data.label}</div>
    <div className="space-x-1 mt-1">
      <button onClick={data.onAddBranch} className="px-1 bg-green-200">+</button>
      <button onClick={data.onRemoveBranch} className="px-1 bg-red-200">-</button>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const nodeTypes = { switch: SwitchNode };

export default function WorkflowGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const addBranch = useCallback(() => {
    const id = `n${Date.now()}`;
    const newNode = {
      id,
      type: "default",
      position: { x: Math.random() * 200, y: Math.random() * 200 + 200 },
      data: { label: "SIMPLE" },
    };
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat({ id: `e-${nodes[1].id}-${id}`, source: nodes[1].id, target: id }));
  }, [setNodes, setEdges, nodes]);

  const removeBranch = useCallback(() => {
    setNodes((nds) => nds.slice(0, nds.length - 1));
    setEdges((eds) => eds.slice(0, eds.length - 1));
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const enrichedNodes = nodes.map((n) =>
    n.id === "switch" ? { ...n, data: { ...n.data, onAddBranch: addBranch, onRemoveBranch: removeBranch } } : n
  );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
