import React from "react";
import { Form, Input, Button } from "@heroui/react";
import DefaultLayout from "@/layouts/default";
import { addToast } from "@heroui/react";
import { siteConfig } from "@/config/site";
import { Link } from "@heroui/link";
import { login } from "@/components/auth-api";


type LoginFormData = {
  email: string;
  password: string;
};

type LoginFormErrors = {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
};

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<LoginFormErrors>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: LoginFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    // Basic client-side validation
    const newErrors: LoginFormErrors = {};
    if (!data.email) newErrors.email = "email is required";
    if (!data.password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log(data);
      await login(data.email, data.password);
      addToast({
        title: "Logged in",
        description: "You were logged in!",
        color: "success",
      });
    } catch (error: any) {
      let errorMessage = "Login failed";
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = error.response.data.error || "Invalid credentials";
            break;
          case 400:
            errorMessage = error.response.data.error || "Invalid request";
            break;
          default:
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
        onSubmit={onSubmit}
      >
        <div className="flex flex-col gap-4 max-w-md">
          <h1 className="text-2xl font-bold text-center">Log in</h1>

          <Input
            isRequired
            errorMessage={errors.email}
            isInvalid={!!errors.email}
            label="Email"
            labelPlacement="outside"
            name="email"
            placeholder="Enter your email"
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
          />

          <div className="flex gap-4 pt-2">
            <Button 
              className="w-full" 
              color="primary" 
              type="submit"
              isLoading={isSubmitting}
            >
              Login
            </Button>
            <Button type="reset" variant="bordered">
              Reset
            </Button>
          </div>

          <div className="text-center text-small">
            Don't have an account?{' '}
              <Link href={siteConfig.links.signup}> sign up </Link>
          </div>
        </div>
      </Form>
    </DefaultLayout>
  );
}