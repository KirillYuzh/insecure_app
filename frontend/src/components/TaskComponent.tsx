import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ErrorMessage from './ErrorMessageComponent';
import { api } from './api';
import { toast } from 'react-toastify';


export type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  weight: number;
  active: boolean;
  flag: string;
};

export type FlagIsSolved = {
  solved: boolean;
};

export default function TaskComponent() {
  const [task, setTask] = useState<Task | null>(null);
  const [flag, setFlag] = useState("");
  const params = useParams<{ id: string }>(); // Используем params.id
  const [flagIsSolved, setFlagIsSolved] = useState<FlagIsSolved | null>(null);

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const result = await api.post<FlagIsSolved>(
            `/tasks/${params.id}/flag/`,
            { flag: flag }
        );
        setFlagIsSolved(result.data);
        if (result.data.solved) {
          toast.success('Task solved!', { className: 'custom-toast', });
        } else {
            toast.error('Flag is incorrect!', { className: 'custom-toast', });
        }
    } catch (err: any) {
        toast.info('Failed to submit flag. Please, try again.', { className: 'custom-toast', });
    }
};

  useEffect(() => {
    const taskId = params.id; // Используем params.id
    console.log("Fetching task with ID:", taskId); // Логируем ID задачи
    if (taskId) {
      api.get<Task>(`/tasks/${taskId}/`)
        .then((response) => {
          console.log("Task fetched:", response.data); // Логируем полученные данные
          setTask(response.data);
        })
        .catch((error) => {
          console.error("Error fetching task:", error);
        });
    } else {
      console.error("Task ID is undefined");
    }
  }, [params.id]); // Зависимость от params.id

  return (
    <>
      {task && (
        <div>
          <div className="card" style={{ width: '40rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '4rem'}}>
            <h2 style={{ textAlign: 'center' }}>{ task.title } <span style={{ color: 'var(--silver)'}}>({ task.category })</span></h2>
            <p style={{ textAlign: 'left', marginTop: '2rem' }}>{ task.description }</p>
            <form onSubmit={handleFlag} style={{ marginTop: '2rem' }}>
              <input
                type="text"
                placeholder="flag"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                required
              />
              <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content', marginTop: '1rem' }}>
                <button type="submit">Post flag</button>
              </div>
            </form>
          </div>
          {flagIsSolved?.solved && <ErrorMessage e="Solved!" />}
        </div>
      )}
    </>
  );
}