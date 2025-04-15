import React, { useState, useEffect } from 'react';
import { api } from '@/components/api';
import DefaultLayout from '@/layouts/default';
import { title } from "@/components/primitives";

type Input = {
  input: string;
};

const Test: React.FC = () => {
  const [input, setInput] = useState<Input | null>(null);

  useEffect(() => {
    api.get("test")
      .then((response) => {
        const data = response.data;
        setInput({
          input: data.message,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch data", error);
      })
  }, []);


  return (
    <DefaultLayout>
      <h1 className={title()}>{input && input.input}</h1>
    </DefaultLayout>
  );
};

export default Test;