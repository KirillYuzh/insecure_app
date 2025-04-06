import { 
  Card, 
  CardHeader, 
  CardBody, 
  Checkbox, 
  CheckboxGroup,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  Chip,
  Divider,
  Link,
  useDisclosure
} from "@nextui-org/react";
import confetti from 'canvas-confetti';
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from 'react';
import { api } from "@/components/api";
import { addToast } from "@heroui/react";

export type Task = {
  id: number;
  title: string;
  category: string;
  description: string;
  weight: number;
  files?: { url: string; name: string }[]; // Добавлено поле для файлов
};

const categories = [
  'web', 'pwn', 'reverse engineering', 'osint', 'cryptography', 'forensic', 'misc'
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(categories);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [solvedTasks, setSolvedTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [flag, setFlag] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleCardPress = (task: Task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
  
    try {
      const result = await api.post<{ solved: boolean }>(
        `/tasks/${selectedTask.id}/flag/`,
        { flag: flag }
      );
  
      if (result.data.solved) {
        // Конфетти!
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
  
        // Очищаем флаг
        setFlag("");
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
    }
  };

  useEffect(() => {
    api.get('tasks/')
      .then((response) => {
        const sortedTasks = response.data.tasks.sort((a: Task, b: Task) => 
          a.category.localeCompare(b.category) || a.weight - b.weight
        );
        setTasks(sortedTasks);
        setAvailableCategories(Array.from(new Set(sortedTasks.map((task: { category: any; }) => task.category))));
        
        if (response.data.user) {
          setSolvedTasks(response.data.user.solved_tasks || []);
        }
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

  const isTaskSolved = (taskId: number) => {
    return solvedTasks.includes(taskId.toString());
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <div>Loading...</div>
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
        <h1 className={title()} style={{ marginBottom: 'auto', marginTop: 'auto', height: '7rem'}}>Tasks</h1>
        
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[fit-content(200px)_1fr] gap-6">
          {/* Левая колонка с категориями */}
          <div className="sticky top-4 h-fit">
            <CheckboxGroup
              label="Select categories"
              value={visibleCategories}
              onValueChange={setVisibleCategories}
              className="w-full"
            >
              {categories.map(category => {
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
            {tasks
              .filter(task => visibleCategories.includes(task.category))
              .map(task => (
                <Card 
                  key={task.id}
                  isPressable
                  onPress={() => handleCardPress(task)}
                  className="h-[10rem] hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="flex-col items-start pb-0 pt-2 px-4">
                    <p className="text-tiny uppercase font-bold text-default-500">{task.category}</p>
                    <h4 className="font-bold text-large line-clamp-1">{task.title}</h4>
                  </CardHeader>
                  <CardBody className="px-4 py-2">
                    <div className="flex flex-col h-full justify-between">
                      <p className="text-sm text-default-500 line-clamp-2">{task.description}</p>
                      <div className="flex justify-end">
                        <span className={`font-bold text-lg px-3 py-1 rounded-full ${
                          isTaskSolved(task.id) 
                            ? "text-success bg-success/10" 
                            : "text-primary bg-primary/10"
                        }`}>
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
            {(onClose) => (
              <>
                {selectedTask && (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      <div className="flex justify-between items-center w-full">
                        <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
                      </div>
                      <Chip color="primary" variant="flat">
                        {selectedTask.weight} points
                      </Chip>
                      <Chip color="secondary" variant="flat">
                          {selectedTask.category}
                      </Chip>
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
                          onSubmit={handleFlagSubmit}
                          fullWidth
                        >
                          Submit Flag
                        </Button>
                      </form>
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