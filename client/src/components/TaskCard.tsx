import { useState } from 'react';
import { Pen } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  onSave: (id: string, title: string, description: string) => Promise<void>;
}

function TaskCard({ id, title, description, onSave }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [saving, setSaving] = useState(false);

  const editHandler = () => {
    setIsEditing(true);
  };

  const saveHandler = async () => {
    setSaving(true);
    await onSave(id, editTitle, editDescription);
    setSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="cursor-grab rounded-lg bg-[#754b34] p-4 shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-3/4 rounded p-1 text-black"
          />
        ) : (
          <h1 className="font-medium text-neutral-100">{title}</h1>
        )}

        {isEditing ? (
          <button onClick={saveHandler} disabled={saving} className="text-black-800 font-semibold">
            {saving ? 'Saving...' : 'Save'}
          </button>
        ) : (
          <button onClick={editHandler}>
            <Pen />
          </button>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="w-full mt-2 rounded p-1 text-black"
        />
      ) : (
        <p className="mt-2 text-sm text-neutral-400">{description}</p>
      )}
    </div>
  );
}

export default TaskCard;
