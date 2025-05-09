import { useState } from 'react';

export interface Chapter {
  id: number;
  title: string;
  content: string;
  lastUpdated?: Date;
}

export function useChapters(initialChapters: Chapter[] = []) {
  // Default to one empty chapter if none provided
  const [chapters, setChapters] = useState<Chapter[]>(
    initialChapters.length > 0 
      ? initialChapters 
      : [{ id: 1, title: 'Capítulo 1', content: '', lastUpdated: new Date() }]
  );
  
  const [activeChapterId, setActiveChapterId] = useState<number>(
    chapters.length > 0 ? chapters[0].id : 1
  );

  // Get the active chapter object
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  
  // Add a new chapter
  const addChapter = () => {
    const newId = chapters.length > 0 
      ? Math.max(...chapters.map(c => c.id)) + 1 
      : 1;
    
    const newChapter: Chapter = {
      id: newId,
      title: `Capítulo ${newId}`,
      content: '',
      lastUpdated: new Date()
    };
    
    setChapters([...chapters, newChapter]);
    setActiveChapterId(newId);
    
    return newChapter;
  };
  
  // Update a chapter's content
  const updateChapterContent = (id: number, content: string) => {
    setChapters(prev => 
      prev.map(chapter => 
        chapter.id === id 
          ? { ...chapter, content, lastUpdated: new Date() } 
          : chapter
      )
    );
  };
  
  // Update a chapter's title
  const updateChapterTitle = (id: number, title: string) => {
    setChapters(prev => 
      prev.map(chapter => 
        chapter.id === id 
          ? { ...chapter, title, lastUpdated: new Date() } 
          : chapter
      )
    );
  };
  
  // Delete a chapter
  const deleteChapter = (id: number) => {
    // Don't delete if it's the only chapter
    if (chapters.length <= 1) {
      return false;
    }
    
    setChapters(prev => prev.filter(chapter => chapter.id \!== id));
    
    // If the active chapter was deleted, set another one as active
    if (activeChapterId === id) {
      // Find the previous chapter, or the first one if there is no previous
      const index = chapters.findIndex(c => c.id === id);
      const newActiveId = index > 0 
        ? chapters[index - 1].id 
        : chapters.find(c => c.id \!== id)?.id || 1;
      
      setActiveChapterId(newActiveId);
    }
    
    return true;
  };
  
  // Reorder chapters
  const reorderChapters = (startIndex: number, endIndex: number) => {
    const result = Array.from(chapters);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    setChapters(result);
  };
  
  // Get total word count across all chapters
  const getTotalWordCount = () => {
    return chapters.reduce((count, chapter) => {
      const words = chapter.content.trim().split(/\s+/).filter(word => word.length > 0);
      return count + words.length;
    }, 0);
  };
  
  return {
    chapters,
    activeChapterId,
    activeChapter,
    setActiveChapterId,
    addChapter,
    updateChapterContent,
    updateChapterTitle,
    deleteChapter,
    reorderChapters,
    getTotalWordCount
  };
}
EOL < /dev/null