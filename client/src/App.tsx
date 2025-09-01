import axios from "axios";
import { useEffect, useState } from "react";
import TaskCard from "./components/TaskCard";
import Header from "./components/Header";
import { Trash } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
};

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const statuses = ["Started", "In-progress", "Completed", "Cancelled"];
  const [refresh, setRefresh] = useState<number>(0);

  useEffect(() => {
    axios
      .get("http://localhost:8000/get")
      .then((res) => {
        console.log(res.data);
        setTasks(res.data);
      })
      .catch((err) => {
        console.log(() => err.message);
      });
  }, [refresh]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId === "trash") {
      axios
        .delete(`http://localhost:8000/delete/${draggableId}`)
        .then(() =>
          setTasks((prev) => prev.filter((task) => task._id !== draggableId))
        )
        .catch((err) => console.error(err));
      return;
    }

    const from = source.droppableId.toLowerCase();
    const to = destination.droppableId.toLowerCase();

    if (from === "completed") return;
    if (from === "in-progress" && to === "started") return;
    if (from === "cancelled" && (to === "in-progress" || to === "completed"))
      return;

    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(
      (task) => task._id === draggableId
    );
    const [movedTask] = updatedTasks.splice(taskIndex, 1);
    movedTask.status = to;

    const columnTasks = updatedTasks.filter((task) => task.status === to);
    columnTasks.splice(destination.index, 0, movedTask);

    let newTasks: typeof updatedTasks = [];
    const columns = ["started", "in-progress", "completed", "cancelled"];
    for (const col of columns) {
      if (col === to) newTasks = newTasks.concat(columnTasks);
      else
        newTasks = newTasks.concat(
          updatedTasks.filter((task) => task.status === col)
        );
    }

    setTasks(newTasks);

    axios
      .put(`http://localhost:8000/update/${movedTask._id}`, {
        status: movedTask.status,
        order: destination.index,
      })
      .then((res) => console.log("Updated:", res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className=" bg-[#292829] min-h-screen ">
      <Header setRefresh={setRefresh} />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 m-8 ">
          {statuses.map((status) => (
            <Droppable key={status} droppableId={status.toLowerCase()}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 p-4 bg-[#817381] rounded-lg "
                >
                  <div
                    key={status}
                    className="flex-1 p-4 bg-[#5d636e] rounded-lg "
                  >
                    <h2 className="text-xl font-bold mb-4 m-2">{status}</h2>
                    {tasks
                      .filter((task) => task.status === status.toLowerCase())
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => {
                            const isOverTrash =
                              snapshot.draggingOver === "trash";
                            return (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`m-2 transition-transform duration-200 ${
                                  isOverTrash ? "scale-90" : "scale-100"
                                }`}
                              >
                                <TaskCard
                                  key={task._id}
                                  id={task._id}
                                  title={task.title}
                                  description={task.description}
                                  onSave={async (
                                    id,
                                    newTitle,
                                    newDescription
                                  ) => {
                                    await axios.put(
                                      `http://localhost:8000/update/${id}`,
                                      {
                                        title: newTitle,
                                        description: newDescription,
                                      }
                                    );
                                    setRefresh((prev) => prev + 1); // refresh tasks after save
                                  }}
                                />
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                  </div>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
        <Droppable droppableId="trash">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`fixed bottom-4 right-4 w-12 h-12 rounded-lg flex items-center justify-center
         transition-transform duration-200
        ${snapshot.isDraggingOver ? "scale-125" : "scale-100"}`}
            >
              <Trash className="w-10 h-10 text-white" />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
