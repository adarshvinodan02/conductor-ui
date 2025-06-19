import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Select,
} from "@material-ui/core";

const TYPES = ["SIMPLE", "HTTP", "SWITCH", "SUB_WORKFLOW"];

export default function EditTaskDialog({ open, node, onClose, onSave }) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState(TYPES[0]);

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || "");
      setType(node.data.type || TYPES[0]);
    }
  }, [node]);

  const handleSave = () => {
    onSave({ id: node.id, label, type });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
        >
          {TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave}>Save</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
