import { useEffect, useMemo, useState } from 'react';
import {
  Card, CardHeader, CardBody, Checkbox, CheckboxGroup,
  Modal, ModalContent, ModalHeader, ModalBody,
  Input, Button, Chip, Divider, Link, useDisclosure
} from "@nextui-org/react";
import confetti from 'canvas-confetti';
import { addToast } from "@heroui/react";

import DefaultLayout from "@/layouts/default";
import { title } from "@/components/primitives";
import { api, submit_flag } from '@/components/challenge-api';

interface Task {
  id: string;
  title: string;
  description: string;
  weight: number;
  category: string;
  solved: boolean;
  files?: Array<{
    name: string;
    url: string;
  }>;
}

const categories = [
  'web', 'pwn', 'reverse engineering', 'osint', 'cryptography', 'forensic', 'misc', 'solved'
] as const;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(
    categories.filter(category => category !== 'solved')
  );
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [flag, setFlag] = useState("");
  // const [task_id, setTaskID] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Фильтруем задачи в зависимости от выбранных категорий
  const filteredTasks = useMemo(() => {
    const showSolved = visibleCategories.includes('solved');
    const otherCategories = visibleCategories.filter(cat => cat !== 'solved');
    
    return tasks.filter(task => {
      const categoryMatch = otherCategories.length === 0 || otherCategories.includes(task.category);
      const solvedMatch = showSolved ? task.solved : true;
      return categoryMatch && solvedMatch;
    });
  }, [tasks, visibleCategories]);

  const handleCardPress = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setIsSubmitting(true);

    try {
      var task_id = selectedTask.id
      var result = await submit_flag(task_id, flag)

      if (result.data == "Correct flag!") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast({
          title: "Success",
          description: "Task solved!",
          color: "success",
        });

        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === selectedTask.id ? { ...task, solved: true } : task
          )
        );

        setFlag("");
        onOpenChange();
      } else {
        addToast({
          title: "Error",
          description: "Flag is incorrect!",
          color: "danger",
        });
      }
    } catch (err) {
      console.error("Flag submission failed:", err);
      addToast({
        title: "Error",
        description: "Failed to submit flag",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    api.get<Task[]>('tasks/')
      .then((response) => {
        const tasks = response.data;
        
        const sortedTasks = tasks.sort((a: Task, b: Task) =>
          a.category.localeCompare(b.category) || b.weight - a.weight
        );

        setTasks(sortedTasks);
        // Добавляем стандартные категории без 'solved'
        setAvailableCategories([
          ...Array.from(new Set(sortedTasks.map(task => task.category)))
        ]);
      })
      .catch(error => {
        console.error('Error loading tasks:', error);
        addToast({
          title: "Error",
          description: "Failed to load tasks",
          color: "danger",
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <h6>Loading...</h6>
        </section>
      </DefaultLayout>
    );
  }

  if (tasks.length === 0) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div>No tasks available.</div>
        </section>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center gap-4 py-8 md:py-10 px-4">
        <h1 className={title()} style={{ marginBottom: 'auto', marginTop: 'auto', height: '7rem' }}>
          Tasks
        </h1>

        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[fit-content(200px)_1fr] gap-6">
          {/* Левая колонка с категориями */}
          <div className="sticky top-4 h-fit">
            <CheckboxGroup
              label=""
              value={visibleCategories}
              onValueChange={setVisibleCategories}
              className="w-full"
            >
              <div className="mb-4">
                <p className="text-sm text-default-500 mb-2">Filter tasks:</p>
                <Checkbox
                  value="solved"
                  classNames={{
                    wrapper: visibleCategories.includes('solved')
                      ? "bg-green-500 border-green-500"
                      : "bg-gray-200 border-gray-200"
                  }}
                >
                  <span className="font-semibold">solved</span>
                </Checkbox>
              </div>
              
              <Divider className="my-2" />
              
              <p className="text-sm text-default-500 mb-2">Categories:</p>
              
              {categories.filter(c => c !== 'solved').map(category => {
                const isAvailable = availableCategories.includes(category);
                return (
                  <Checkbox
                    key={category}
                    value={category}
                    isDisabled={!isAvailable}
                    classNames={{
                      base: isAvailable ? "" : "opacity-50",
                      label: isAvailable ? "" : "text-default-500",
                      wrapper: visibleCategories.includes(category)
                        ? "bg-purple-500 border-purple-500"
                        : "bg-gray-200 border-gray-200"
                    }}
                  >
                    <span className={!isAvailable ? "text-gray-500" : ""}>
                      {category}
                    </span>
                  </Checkbox>
                );
              })}
            </CheckboxGroup>
          </div>

          {/* Карточки задач */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <Card
                key={task.id}
                isPressable
                onPress={() => handleCardPress(task)}
                className="h-[10rem] hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex-col items-start pb-0 pt-2 px-4">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-2xl font-bold" style={{ margin: '1rem', marginLeft: '0rem' }}>
                      {task.title}
                    </h2>
                    <div className="flex gap-2">
                      {task.solved && (
                        <Chip color="success" variant="flat">solved</Chip>
                      )}
                      <Chip color="secondary" variant="flat">{task.category}</Chip>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="px-4 py-2">
                  <div className="flex flex-col h-full justify-between">
                  <p className="text-sm text-default-500 line-clamp-2">
                    {task.description.length > 30 
                      ? `${task.description.substring(0, 30)}...` 
                      : task.description
                    }
                  </p>
                    <div className="flex justify-end" style={{ gap: '0.5rem' }}>
                      <span className={`font-bold text-lg px-3 py-1 rounded-full text-primary bg-primary/10`}
                      style={{ marginBottom: '0.5rem' }}>
                        {task.weight} pts
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Модальное окно задачи */}
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          size="3xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {() => (
              <>
                {selectedTask && (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      <div className="flex justify-between items-center w-full">
                        <h2 className="text-2xl font-bold" style={{ margin: '1rem', marginLeft: '0rem' }}>{selectedTask.title}</h2>
                        {selectedTask.solved && (
                          <Chip color="success" variant="flat">solved</Chip>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Chip color="primary" variant="flat">
                          {selectedTask.weight} points
                        </Chip>
                        <Chip color="secondary" variant="flat">
                          {selectedTask.category}
                        </Chip>
                      </div>
                    </ModalHeader>
                    <ModalBody>
                      <div className="whitespace-pre-line">
                        {selectedTask.description}
                      </div>

                      {selectedTask.files && selectedTask.files.length > 0 && (
                        <>
                          <Divider className="my-4" />
                          <div>
                            <h4 className="font-bold mb-2">Files:</h4>
                            <div className="space-y-2">
                              {selectedTask.files.map((file, index) => (
                                <Link
                                  key={index}
                                  href={file.url}
                                  isExternal
                                  showAnchorIcon
                                  className="flex items-center gap-2"
                                >
                                  {file.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <Divider className="my-4" />

                      {!selectedTask.solved && (
                        <form onSubmit={handleFlagSubmit} className="space-y-4">
                          <Input
                            type="text"
                            label="Flag"
                            placeholder="Enter your flag"
                            value={flag}
                            onChange={(e) => setFlag(e.target.value)}
                            isRequired
                            fullWidth
                          />
                          <Button
                            type="submit"
                            color="primary"
                            fullWidth
                            isLoading={isSubmitting}
                            style={{ marginBottom: '0.5rem' }}
                          >
                            Submit Flag
                          </Button>
                        </form>
                      )}
                    </ModalBody>
                  </>
                )}
              </>
            )}
          </ModalContent>
        </Modal>
      </section>
    </DefaultLayout>
  );
}