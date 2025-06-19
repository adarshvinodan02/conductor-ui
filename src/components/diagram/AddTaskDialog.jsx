import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
} from "@material-ui/core";

const TYPES = ["SIMPLE", "HTTP", "SWITCH", "SUB_WORKFLOW"];

export default function AddTaskDialog({ open, onClose, onAdd }) {
  const [type, setType] = useState(TYPES[0]);

  const handleAdd = () => {
    onAdd(type);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Task Type</DialogTitle>
      <DialogContent>
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
