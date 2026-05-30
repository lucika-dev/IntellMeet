import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/mockApi';
import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PageTransition } from '../components/PageTransition';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-muted/30' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-primary/5' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500/5' },
];

export const KanbanBoardPage = () => {
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: api.fetchTasks });
  const [newTask, setNewTask] = useState('');
  const qc = useQueryClient();

  const addTask = useMutation({
    mutationFn: (title: string) =>
      api.addTask({ title, status: 'todo', assignee: 'Current User' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task added successfully!');
    },
    onError: () => toast.error('Failed to add task'),
  });

  const moveTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => api.updateTaskStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleDragStart = (e: any, id: string) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('id', id);
    }
  };

  const handleDrop = (e: any, status: string) => {
    if (e.dataTransfer) {
      const id = e.dataTransfer.getData('id');
      moveTask.mutate({ id, status });
      toast.success('Task moved');
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask.mutate(newTask);
      setNewTask('');
    } else {
      toast.error('Please enter a task title');
    }
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Project Board
            </h1>
            <p className="text-muted-foreground mt-1">
              Drag & drop tasks to update status
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task title"
              className="px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary transition bg-card text-foreground"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add task</span>
            </motion.button>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div
              key={col.id}
              className={`${col.color} rounded-xl p-4 border border-border/50 transition-all duration-200`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.id === 'todo' ? 'bg-muted-foreground' : col.id === 'in-progress' ? 'bg-primary' : 'bg-emerald-500'}`} />
                {col.title}
                <span className="text-xs text-muted-foreground ml-auto">
                  {tasks.filter((t) => t.status === col.id).length}
                </span>
              </h3>
              <div className="space-y-3 min-h-[200px]">
                {tasks
                  .filter((t) => t.status === col.id)
                  .map((task, idx) => (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="bg-card p-4 rounded-xl border border-border shadow-sm cursor-move hover:shadow-md transition-all group hover-lift"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="font-medium text-foreground">{task.title}</div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 opacity-70">
                        <Sparkles size={12} className="text-primary" />
                        <span>@{task.assignee}</span>
                      </div>
                    </motion.div>
                  ))}
                {tasks.filter((t) => t.status === col.id).length === 0 && (
                  <div className="text-center text-muted-foreground/60 text-sm py-12 border-2 border-dashed border-border rounded-xl">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};
