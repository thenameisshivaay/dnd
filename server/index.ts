import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import mongoose, { Document, Schema } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const PORT =  process.env.PORT || 8000;
const URL: string | undefined = process.env.MONGO_URL;

const app = express();
app.use(express.json());
app.use(cors());

if (URL) {
    mongoose.connect(URL)
        .then(() => console.log("MongoDB Connected successfully"))
        .catch((err) => console.log({ message: "NOT connected", err }));
} else {
    console.error('MONGO_URL not defined in environment variables.');
}

interface ITask extends Document {
    title: string;
    description: string;
    status: string;
    order: number;
}

const ToDoSchema: Schema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['started', 'in-progress', 'completed', 'cancelled'],
        default: 'started'
    },
    order: { type: Number, required: true, default: 0 }
});

const Task = mongoose.model<ITask>('Task', ToDoSchema);

app.get("/get", async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find({}).sort({ status: 1, order: 1 });
        res.status(200).json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
});

app.post("/addtask", async (req: Request, res: Response) => {
    const { title, description, status } = req.body;
    try {
        const count = await Task.countDocuments({ status: status || 'started' });
        const newTask = await Task.create({
            title,
            description,
            status: status || 'started',
            order: count
        });
        res.status(201).json(newTask);
    } catch (error: any) {
        res.status(500).json({ message: "Error in adding task", error: error.message });
    }
});




app.delete("/delete/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleteTask = await Task.findByIdAndDelete(id);
        if (!deleteTask) return res.status(404).send({ message: "Task not found" });
        res.status(200).json({ message: "Task deleted successfully", deleteTask });
    } catch (error: any) {
        res.status(500).send({ message: "Task not found", error: error.message });
    }
});

app.put("/update/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, status, order } = req.body;

    try {
        const task = await Task.findById(id);
        if (!task) return res.status(404).send({ message: "Task not found" });


        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        task.status = status || task.status;
        task.order = typeof order === "number" ? order : task.order;

        await task.save();


        const tasksInColumn = await Task.find({
            _id: { $ne: id },
            status: task.status,
        }).sort({ order: 1 });

        tasksInColumn.forEach(async (t, idx) => {
            t.order = idx >= task.order ? idx + 1 : idx;
            await t.save();
        });

        res.status(200).send(task);
    } catch (error: any) {
        res.status(500).send({ message: "Error updating task", error: error.message });
    }
});


app.listen(PORT, () => console.log("Server is listening on port", PORT));
