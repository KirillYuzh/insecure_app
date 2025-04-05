import { useEffect, useState } from 'react';
import { api } from '../components/api';


export default function HomePage() {
    const [readme, setReadme] = useState<string[]>([]);

    useEffect(() => {
        api.get("").then((response) => {
            setReadme(response.data.description);
        });
    }, []);

    const renderLine = (line: string, index: number) => {
        if (line.startsWith('## ')) {
            // Если строка начинается с "## ", делаем её заголовком h2, центрируем и красим в красный
            return (
                <h2 key={index} style={{ textAlign: 'center', color: 'var(--purple)', }}>
                    { line.replace('## ', '') }
                </h2>
            );
        } else if (line.startsWith('# ')) {
            // Если строка начинается с "# ", делаем её заголовком h4 и красим в зелёный
            return (
                <h4 key={index} style={{ color: 'var(--purple)', }}>
                    { line.replace('# ', '') }
                </h4>
            );
        } else if (line.startsWith('- ')) {
            // Если строка начинается с "- ", добавляем отступ слева
            return (
                <p key={index} style={{ marginLeft: '20px', wordBreak: 'break-word' }}>
                    { line }
                </p>
            );
        } else {
            // Для всех остальных строк просто возвращаем параграф
            return (
                <p key={index} style={{ wordBreak: 'break-word' }}>
                    { line }
                </p>
            );
        }
    };

    return (
        <>
            <div className='card' style={{ width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
                {readme.map((line, index) => renderLine(line, index))}
            </div>
        </>
    );
}