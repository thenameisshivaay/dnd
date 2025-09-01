import axios from "axios";
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

interface HeaderProps {
  setRefresh: Dispatch<SetStateAction<number>>;
}


function Header({ setRefresh }: HeaderProps) {
  const [name, setName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const userAdded = () => {
    axios
      .post("http://localhost:8000/addtask", {
        title: name,
        description: content,
      })
      .then((res) => {
        console.log(res.data);
        setName("");
        setContent("");
        setVisible(false);
        setRefresh(prev => prev + 1); 
      });
  };
  const handleClose = () => setVisible(false);

  return (
    <div className="flex justify-between bg-[#292829] w-screen h-15 p-5">
      <h1 className="text-2xl  text-neutral-100 font-bold underline">
        TODO LIST WITH DRAG AND DROP
      </h1>
      {visible ? (
        <Modal open={visible} onClose={handleClose}>
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add a New Task
            </Typography>

            <TextField
              fullWidth
              label="Task Title"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 2 }}
            />

            <TextField
              fullWidth
              label="Task Description"
              variant="outlined"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ mt: 2 }}
            />

            <Button variant="contained" onClick={userAdded} >
              Add Task
            </Button>
          </Box>
        </Modal>
      ) : (
        <button
          onClick={() => setVisible(!visible)}
          className="text-neutral-100 text-xl bg-blue-500 px-3 h-10 hover:bg-blue-300 hover:text-black hover:scale-105 transition-transform duration-200 rounded-lg ease-in-out">
          ADD TASK
        </button>
      )}
    </div>
  );
}

export default Header;
