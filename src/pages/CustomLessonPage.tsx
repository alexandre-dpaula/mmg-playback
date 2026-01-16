import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LessonPage } from "@/components/LessonPage";

type Technique = {
  id: string;
  youtubeUrl: string;
  path: string;
  title: string;
  tag: string;
  artist: string;
  thumbnail: string;
};

const CustomLessonPage: React.FC = () => {
  const { instrumentId, lessonId } = useParams<{ instrumentId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Technique | null>(null);

  const handleDelete = () => {
    if (!instrumentId || !lessonId) return;

    const confirmDelete = window.confirm("Tem certeza que deseja excluir esta aula personalizada?");
    if (!confirmDelete) return;

    // Remove a aula do localStorage
    const storageKey = `custom_lessons_${instrumentId}`;
    const storedLessons = localStorage.getItem(storageKey);

    if (storedLessons) {
      try {
        const parsed: Technique[] = JSON.parse(storedLessons);
        const updatedLessons = parsed.filter((l) => l.id !== lessonId);
        localStorage.setItem(storageKey, JSON.stringify(updatedLessons));

        // Redireciona para a página do instrumento
        navigate(`/study/pro/${instrumentId}`);
      } catch (error) {
        console.error("Erro ao excluir aula:", error);
        alert("Erro ao excluir aula. Tente novamente.");
      }
    }
  };

  useEffect(() => {
    if (!instrumentId || !lessonId) {
      navigate("/study/pro");
      return;
    }

    // Carrega aulas personalizadas do localStorage
    const storageKey = `custom_lessons_${instrumentId}`;
    const storedLessons = localStorage.getItem(storageKey);

    if (storedLessons) {
      try {
        const parsed: Technique[] = JSON.parse(storedLessons);
        const foundLesson = parsed.find((l) => l.id === lessonId);

        if (foundLesson) {
          setLesson(foundLesson);
        } else {
          // Aula não encontrada, redireciona
          navigate(`/study/pro/${instrumentId}`);
        }
      } catch (error) {
        console.error("Erro ao carregar aula personalizada:", error);
        navigate(`/study/pro/${instrumentId}`);
      }
    } else {
      // Sem aulas personalizadas, redireciona
      navigate(`/study/pro/${instrumentId}`);
    }
  }, [instrumentId, lessonId, navigate]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <LessonPage
      youtubeUrl={lesson.youtubeUrl}
      title={lesson.title}
      tag={lesson.tag}
      artist={lesson.artist}
      isCustomLesson={true}
      onDelete={handleDelete}
    />
  );
};

export default CustomLessonPage;
