import { useEffect, useState } from 'react';
import { api } from './api';
import { toast } from 'react-toastify';


export type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  weight: number;
};

const categories = [
  'web', 'pwn', 'reverse engineering', 'osint', 'cryptography', 'forensic', 'misc'
];

export default function ListTasksComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(categories);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    api.get('tasks/')
      .then((response) => {
        const sortedTasks = response.data.tasks.sort((a: Task, b: Task) => 
          a.category.localeCompare(b.category) || a.weight - b.weight
        );
        setTasks(sortedTasks);
        
        // Определяем доступные категории (где есть задачи)
        const taskCategories: string[] = Array.from(new Set(sortedTasks.map((task: Task) => task.category)));
        setAvailableCategories(taskCategories);
      })
      .catch((error) => {
        console.error('Failed to fetch tasks:', error);
        toast.error('Failed to fetch tasks', {
          className: 'custom-toast',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const toggleCategory = (category: string) => {
    if (!availableCategories.includes(category)) return;
    setVisibleCategories((prev) =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks available.</div>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2rem' }}>
      {/* Левая колонка с категориями */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem', marginLeft: '2rem', }}>
        {categories.map((category) => {
          const isAvailable = availableCategories.includes(category);
          if (isAvailable){
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                disabled={!isAvailable}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: visibleCategories.includes(category) ? 'var(--purple)' : 'var(--silver)',
                  color: visibleCategories.includes(category) ? 'var(--white)' : 'var(--black)',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  opacity: isAvailable ? 1 : 0.5
                }}
              >
                {category}
              </button>
            );
          }
          else{
            return (
              <div
                key={category}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--silver)',
                  color: 'var(--black)',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'not-allowed',
                  opacity: 0.5,
                  textAlign: 'center',
                }}
              >
                {category}
              </div>
            );
          }
        })}
      </div>
      
      <div className='blocks' style={{ flexGrow: 1 }}>
        {tasks
          .filter(task => visibleCategories.includes(task.category))
          .map((task) => (
            <div className='tasks-col' style={{ marginLeft: '0rem', marginRight: 'auto' }} key={task.id}>
              <a href={`/tasks/${task.id}/`} className="card-gradient task"> 
                <div>
                  <h3>{task.title}</h3>
                  <h6 className='subtitle'>{task.category}</h6>
                  <h3 style={{ textAlign: 'right' }}>{task.weight}</h3>
                </div>
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}