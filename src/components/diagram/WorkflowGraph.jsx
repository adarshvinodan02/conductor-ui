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
  {
    id: "start",
    position: { x: 0, y: 0 },
    data: { label: "START" },
    type: "task",
  },
  {
    id: "switch",
    position: { x: 0, y: 150 },
    data: { label: "SWITCH" },
    type: "switch",
  },
];

const initialEdges = [{ id: "e1", source: "start", target: "switch" }];

const TaskNode = ({ id, data }) => (
  <div className="bg-blue-100 p-2 rounded border text-center">
    <Handle type="target" position={Position.Top} />
    <div>{data.label}</div>
    <div className="space-x-1 mt-1">
      <button onClick={() => data.onAdd(id)} className="px-1 bg-green-200">
        +
      </button>
      <button onClick={() => data.onRemove(id)} className="px-1 bg-red-200">
        -
      </button>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

const SwitchNode = ({ id, data }) => (
  <div className="bg-yellow-100 p-2 rounded border text-center">
    <Handle type="target" position={Position.Top} />
    <div>{data.label}</div>
    <div className="space-x-1 mt-1">
      <button
        onClick={() => data.onAddBranch(id)}
        className="px-1 bg-green-200"
      >
        +
      </button>
      <button
        onClick={() => data.onRemoveBranch(id)}
        className="px-1 bg-red-200"
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

  const addNode = useCallback(
    (parentId) => {
      const id = `n${Date.now()}`;
      const newNode = {
        id,
        type: "task",
        position: { x: Math.random() * 200, y: Math.random() * 200 + 200 },
        data: { label: "SIMPLE" },
      };
      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) =>
        eds.concat({ id: `e-${parentId}-${id}`, source: parentId, target: id }),
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

  const addSwitchBranch = useCallback(
    (switchId) => addNode(switchId),
    [addNode],
  );

  const removeSwitchBranch = useCallback(
    (switchId) => {
      setEdges((eds) => {
        const branchEdges = eds.filter((e) => e.source === switchId);
        if (!branchEdges.length) return eds;
        const branch = branchEdges[branchEdges.length - 1];
        setNodes((nds) => nds.filter((n) => n.id !== branch.target));
        return eds.filter((e) => e.id !== branch.id);
      });
    },
    [setEdges, setNodes],
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
            onRemoveBranch: removeSwitchBranch,
          },
        }
      : { ...n, data: { ...n.data, onAdd: addNode, onRemove: removeNode } },
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
    </div>
  );
}
