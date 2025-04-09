import React from "react";
import { Form, Input, Button } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";
import { siteConfig } from "@/config/site";
import { signup } from "@/components/api";
import { addToast } from "@heroui/react";

type FormData = {
  username: string;
  email: string;
  name: string;
  password: string;
};

type FormErrors = {
  username?: string;
  email?: string;
  name?: string;
  password?: string;
  [key: string]: string | undefined;
};

export default function SignupPage() {
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const getPasswordError = (value: string): string | null => {
    if (value.length < 8) return "Password must be 8 characters or more";
    if (!/[A-Z]/.test(value)) return "Password needs at least 1 uppercase letter";
    if (!/[^a-zA-Z0-9]/.test(value)) return "Password needs at least 1 symbol";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data: FormData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    };

    // Валидация
    const newErrors: FormErrors = {};
    if (!data.username) newErrors.username = "Username is required";
    if (!data.email) newErrors.email = "Email is required";
    if (!data.name) newErrors.name = "Name is required";
    
    const passwordError = getPasswordError(data.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log(data);
      await signup(data.username, data.email, data.name, data.password);
      
      addToast({
        title: "Success",
        description: "Account created successfully",
        color: "success",
      });
    } catch (error: any) {
      let errorMessage = "Signup failed";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Validation error";
          
          // Обработка ошибок уникальности
          if (error.response.data.error.includes("username")) {
            newErrors.username = "Username already exists";
          }
          if (error.response.data.error.includes("email")) {
            newErrors.email = "Email already exists";
          }
          setErrors(newErrors);
        } else {
          errorMessage = "Server error";
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
        <Form
          className="w-full justify-center items-center space-y-4"
          onReset={() => setErrors({})}
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">Sign up</h1>

            <Input
              isRequired
              errorMessage={errors.username}
              isInvalid={!!errors.username}
              label="Username"
              labelPlacement="outside"
              name="username"
              placeholder="Enter your username"
            />

            <Input
              isRequired
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              label="Name"
              labelPlacement="outside"
              name="name"
              placeholder="Enter your name"
            />

            <Input
              isRequired
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              label="Email"
              labelPlacement="outside"
              name="email"
              placeholder="Enter your email"
              type="email"
            />

            <Input
              isRequired
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              label="Password"
              labelPlacement="outside"
              name="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onValueChange={setPassword}
            />

            <div className="flex gap-4 pt-2">
              <Button 
                className="w-full" 
                color="primary" 
                type="submit"
                isLoading={isSubmitting}
              >
                Sign Up
              </Button>
              <Button type="reset" variant="bordered">
                Reset
              </Button>
            </div>

            <div className="text-center text-small">
              Already have an account?{' '}
              <Link href={siteConfig.links.login}>Log in</Link>
            </div>
          </div>
        </Form>
    </DefaultLayout>
  );
}