import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

const TYPES = ["SIMPLE", "HTTP", "SWITCH", "SUB_WORKFLOW"];

export default function AddTaskDialog({ open, onClose, onAdd }) {
  const [type, setType] = useState(TYPES[0]);
  const [label, setLabel] = useState("");

  const handleAdd = () => {
    onAdd({ type, label: label || type });
    setLabel("");
    setType(TYPES[0]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Task Type</DialogTitle>
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
        <Button onClick={handleAdd}>Add</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
