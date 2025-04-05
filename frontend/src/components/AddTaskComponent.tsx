import React, { useState } from "react";
import { api } from "./api";
import { toast } from 'react-toastify';


export default function AddTaskComponent() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("web"); // Значение по умолчанию
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Преобразуем weight в число
    const weightNumber = parseInt(weight, 10);

    // Отправка данных на сервер
    try {
      await api.post("admin-panel-add-task/", {
        title,
        category,
        description,
        weight: weightNumber,
      });
      toast.success('Task added!', { className: 'custom-toast', });
      // Очистка формы после успешной отправки
      setTitle("");
      setCategory("web");
      setDescription("");
      setWeight("0");
    } catch (error) {
      toast.error('Failed to add task.', { className: 'custom-toast', });
    }
  };

  return (
    <div className="card" style={{ marginTop: "4rem", marginLeft: "auto", marginRight: "auto", width: "20rem" }}>
      <form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center" }}>Add task</h2>
        <br />
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <br />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="web">Web</option>
          <option value="pwn">Pwn</option>
          <option value="reverse engineering">Reverse Engineering</option>
          <option value="osint">OSINT</option>
          <option value="cryptography">Cryptography</option>
          <option value="forensic">Forensic</option>
          <option value="misc">Misc</option>
        </select>
        <br />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5} // Количество строк по умолчанию
          style={{ width: "100%" }} // Ширина текстового поля
        />
        <br />
        <br />
        <input
          type="number"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          min="0"
          max="100000"
          required
        />
        <br />
        <br />
        <div style={{ marginLeft: "auto", marginRight: "auto", width: "fit-content" }}>
          <button type="submit">Post</button>
        </div>
      </form>
    </div>
  );
}