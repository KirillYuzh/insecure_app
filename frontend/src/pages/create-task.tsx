import React from "react";
import { Form, Input, Button, Select, SelectItem } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { addToast } from "@heroui/react";
import { api } from "@/components/api";
import { title, subtitle } from "@/components/primitives";

type TaskFormData = {
  title: string;
  description: string;
  weight: number;
  category: string;
  flag: string;
};

type TaskFormErrors = {
  title?: string;
  description?: string;
  weight?: string;
  category?: string;
  flag?: string;
};

const categories = [
  { label: "Web", value: "web" },
  { label: "Pwn", value: "pwn" },
  { label: "Osint", value: "osint" },
  { label: "Cryptography", value: "cryptography" },
  { label: "R-Engineering", value: "reverse engineering" },
  { label: "Forensic", value: "forensic" },
  { label: "Misc", value: "misc" },
];

export default function CreateTaskPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<TaskFormErrors>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: TaskFormData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      weight: parseInt(formData.get('weight') as string),
      category: formData.get('category') as string,
      flag: formData.get('flag') as string,
    };

    // Валидация
    const newErrors: TaskFormErrors = {};
    if (!data.title) newErrors.title = "Title is required";
    if (!data.description) newErrors.description = "Description is required";
    if (isNaN(data.weight) || data.weight <= 0) newErrors.weight = "Weight must be positive number";
    if (!data.category) newErrors.category = "Category is required";
    if (!data.flag) newErrors.flag = "Flag is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/create-task", data);
      
      addToast({
        title: "Success",
        description: "Task created successfully",
        color: "success",
      });
      
      // Можно перенаправить на страницу задач
      // window.location.href = '/tasks';
    } catch (error: any) {
      let errorMessage = "Task creation failed";
      
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
        
        // Обработка ошибок уникальности
        if (error.response.data.error.includes("title")) {
          newErrors.title = "Task with this title already exists";
          setErrors(newErrors);
        }
      }

      addToast({
        title: "Error",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
    <section className="flex flex-col items-center justify-left gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
            <h1 className={title()}>Create New Task</h1>
        </div>
    </section>

      <div className="max-w-2xl mx-auto p-4">
        <Form onSubmit={handleSubmit} className="space-y-4">
          <Input
            isRequired
            label="Title"
            name="title"
            placeholder="Enter task title"
            errorMessage={errors.title}
            isInvalid={!!errors.title}
            maxLength={32}
          />
          
          <Input
            isRequired
            label="Description"
            name="description"
            placeholder="Enter task description"
            errorMessage={errors.description}
            isInvalid={!!errors.description}
            // multiline
            // minRows={3}
          />
          
          <div className="flex gap-4">
            <Select
              isRequired
              label="Category"
              name="category"
              placeholder="Select category"
              errorMessage={errors.category}
              isInvalid={!!errors.category}
            >
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>
            
            <Input
              isRequired
              label="Weight"
              name="weight"
              type="number"
              placeholder="Enter task weight"
              errorMessage={errors.weight}
              isInvalid={!!errors.weight}
              min={1}
            />
          </div>
          
          <Input
            isRequired
            label="Flag"
            name="flag"
            placeholder="Enter task flag"
            errorMessage={errors.flag}
            isInvalid={!!errors.flag}
            maxLength={200}
            description="Flag that users need to submit"
          />
          
          <div className="flex justify-end gap-2">
            <Button 
              type="submit" 
              color="primary"
              isLoading={isSubmitting}
            >
              Create Task
            </Button>
            <Button type="reset" variant="bordered">
              Reset
            </Button>
          </div>
        </Form>
      </div>
    </DefaultLayout>
  );
}