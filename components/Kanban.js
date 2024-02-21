import React, { useState } from "react";
import { DndContext, useDroppable, useDraggable } from "@dnd-kit/core";

function Droppable(props) {
  const { setNodeRef } = useDroppable({
    id: props.id,
  });
  const className = `p-6 bg-white border border-gray-400 rounded w-60 min-h-[100px]`;

  return (
    <div ref={setNodeRef} className={className}>
      {props.children}
    </div>
  );
}

function Draggable(props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: props.id,
  });
  const style = {
    opacity: isDragging ? 0.5 : 1,
  };
  const className = "p-2 bg-blue-500 text-white rounded cursor-move mb-2";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={className}
    >
      {props.children}
    </div>
  );
}

function Kanban() {
  const [tasks, setTasks] = useState({
    todos: [{ id: "task-1", content: "Task 1" }],
    inProgress: [{ id: "task-2", content: "Task 2" }],
    done: [{ id: "task-3", content: "Task 3" }],
  });

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    let sourceColumn, destinationColumn;

    Object.keys(tasks).forEach((key) => {
      if (tasks[key].some((item) => item.id === active.id)) {
        sourceColumn = key;
      }
      if (over.id.includes(key)) {
        destinationColumn = key;
      }
    });

    if (
      sourceColumn &&
      destinationColumn &&
      sourceColumn !== destinationColumn
    ) {
      const sourceItems = tasks[sourceColumn].filter(
        (item) => item.id !== active.id
      );
      const destinationItems = [
        ...tasks[destinationColumn],
        tasks[sourceColumn].find((item) => item.id === active.id),
      ];

      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: sourceItems,
        [destinationColumn]: destinationItems,
      }));
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex justify-start gap-4">
        {Object.keys(tasks).map((key) => (
          <Droppable key={key} id={key}>
            <h2 className="text-lg font-bold mb-2 capitalize">{key}</h2>
            {tasks[key].map((task) => (
              <Draggable key={task.id} id={task.id}>
                {task.content}
              </Draggable>
            ))}
          </Droppable>
        ))}
      </div>
    </DndContext>
  );
}

export default Kanban;
