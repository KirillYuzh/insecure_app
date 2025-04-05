import { useEffect, useState } from 'react';
import { api } from './api';

export type Task = {
  id: number;
  title: string;
  weight: number;
  category: string;
  description: string;
  active: boolean;
};

export default function IsActiveTaskEdit() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получение задач с бэкенда
  useEffect(() => {
    api.get('all-tasks/')
      .then((response) => {
        setTasks(response.data.tasks);
      })
      .catch((error) => {
        console.error('Failed to fetch tasks:', error);
        setError('Failed to fetch tasks. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Функция для изменения поля active
  const toggleActive = async (taskId: number, newActive: boolean) => {
    try {
        
      // Отправляем изменения на бэкенд
      await api.patch(`tasks/${taskId}/`, { active: newActive });

      // Обновляем состояние на фронтенде
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, active: newActive } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  // Отображение состояния загрузки
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Отображение ошибки
  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  // Отображение списка задач
  return (
    <>
    <br/>
    <hr style={{ width: '90vw', marginLeft: 'auto', marginRight: 'auto', }}/>
    <br/>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1rem', marginLeft: 'auto', marginRight: 'auto', width: '90vw' }}>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div
            className='tasks-col'
            style={{ marginLeft: 'auto', marginRight: '0rem' }}
            key={task.id}
          >
            <a
              href={`/tasks/${task.title}/`}
              className="card-gradient"
              style={{ width: 'fit-content', minWidth: '14rem', maxWidth: '50rem', }}
            >
              <div>
                <h3>{task.title}</h3>
                <h6 className='subtitle'>{task.category}</h6>
                <h3 style={{ textAlign: 'right' }}>{task.weight}</h3>
                <h3 style={{ textAlign: 'right' }}>{task.active}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span>Is active: </span>
                <input
                  type="checkbox"
                  checked={task.active} // Галочка активна, если task.active === true
                  onChange={(e) => toggleActive(task.id, e.target.checked)} // Обновляем состояние при изменении
                />
              </div>
            </a>
          </div>
        ))
      ) : (
        <div>No tasks available.</div>
      )}
    </div>
    </>
  );
}