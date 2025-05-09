import { useState, useEffect, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { useChapters } from './hooks/useChapters';
import { generateWithAI } from './components/ClaudeAIService';
import type { AIRequest } from './components/ClaudeAIService';

function App() {
  // Use custom hooks
  const { theme, toggleTheme } = useTheme();
  const { 
    chapters, 
    activeChapterId, 
    activeChapter, 
    setActiveChapterId, 
    addChapter,
    updateChapterContent,
    getTotalWordCount
  } = useChapters();

  // Local state
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'stats'
  const [aiMode, setAiMode] = useState<AIRequest['mode']>('writing_assistant');
  const [aiAction, setAiAction] = useState('improve');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);
  const [potentialErrors, setPotentialErrors] = useState<Array<{word: string, position: number, suggestions: string[]}>>([]);
  const [showSuggestions, setShowSuggestions] = useState<{word: string, position: number, suggestions: string[]} | null>(null);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update text when active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setText(activeChapter.content);
    }
  }, [activeChapterId, activeChapter]);

  // Calculate word count whenever text changes
  useEffect(() => {
    if (!text) {
      setWordCount(0);
      return;
    }
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Run spell check when text changes if enabled
    if (spellCheckEnabled) {
      runSpellCheck();
    }
  }, [text, spellCheckEnabled]);

  // Close suggestions menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update chapter content when text changes
  const handleTextChange = (newText: string) => {
    setText(newText);
    if (activeChapterId) {
      updateChapterContent(activeChapterId, newText);
    }
  };

  // Handle text selection for formatting
  const handleTextSelection = () => {
    const textarea = document.querySelector('.editor-area') as HTMLTextAreaElement;
    if (textarea) {
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const selected = text.substring(selectionStart, selectionEnd);
      setSelectedText(selected);
    }
  };

  // Apply formatting to selected text
  const applyFormatting = (format: string) => {
    const textarea = document.querySelector('.editor-area') as HTMLTextAreaElement;
    if (textarea) {
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      const selected = text.substring(selectionStart, selectionEnd);
      
      let formattedText = '';
      switch (format) {
        case 'bold':
          formattedText = `**${selected}**`;
          break;
        case 'italic':
          formattedText = `*${selected}*`;
          break;
        case 'underline':
          formattedText = `_${selected}_`;
          break;
        case 'heading1':
          formattedText = `# ${selected}`;
          break;
        case 'heading2':
          formattedText = `## ${selected}`;
          break;
        case 'heading3':
          formattedText = `### ${selected}`;
          break;
        case 'quote':
          formattedText = `> ${selected}`;
          break;
        case 'list':
          formattedText = selected.split('\n').map(line => `- ${line}`).join('\n');
          break;
        default:
          formattedText = selected;
      }
      
      const newText = text.substring(0, selectionStart) + formattedText + text.substring(selectionEnd);
      handleTextChange(newText);
      
      // Restore focus to the textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          selectionStart + formattedText.length,
          selectionStart + formattedText.length
        );
      }, 0);
    }
  };

  // Spell checking functionality
  const runSpellCheck = async () => {
    if (!text) return;
    
    // In a real implementation, this would connect to a spell check API
    // This is a simple simulation for demonstration purposes
    
    // Simple dictionary for common Portuguese errors (for demonstration)
    const commonErrors = {
      'nao': 'não',
      'entao': 'então',
      'voce': 'você',
      'esta': 'está',
      'esta ': 'está ',
      'tambem': 'também',
      'ja': 'já',
      'capitulo': 'capítulo',
      'dificil': 'difícil',
      'facil': 'fácil',
      'possivel': 'possível',
      'aqui': 'aqui',
      'comeco': 'começo',
      'comecar': 'começar',
      'acucar': 'açúcar',
      'alcool': 'álcool',
      'aprendisado': 'aprendizado',
      'atraz': 'atrás',
      'atraves': 'através',
      'cançado': 'cansado',
      'concerteza': 'com certeza',
      'homen': 'homem',
      'obrigatorio': 'obrigatório'
    };
    
    const words = text.split(/\b/);
    const errors: Array<{word: string, position: number, suggestions: string[]}> = [];
    
    let position = 0;
    words.forEach(word => {
      const trimmedWord = word.trim().toLowerCase();
      if (trimmedWord && Object.keys(commonErrors).includes(trimmedWord)) {
        const corrected = commonErrors[trimmedWord as keyof typeof commonErrors];
        errors.push({
          word: trimmedWord,
          position,
          suggestions: [corrected, corrected.toUpperCase()]
        });
      }
      position += word.length;
    });
    
    setPotentialErrors(errors);
  };

  // Handle showing spelling suggestions
  const handleSpellingErrorClick = (error: {word: string, position: number, suggestions: string[]}) => {
    setShowSuggestions(error);
    
    // Position the suggestions dropdown near the error
    setTimeout(() => {
      if (editorRef.current && suggestionsRef.current) {
        const textarea = editorRef.current;
        const textareaRect = textarea.getBoundingClientRect();
        
        // Get the position of the error in the text
        const textBeforeError = text.substring(0, error.position);
        const lines = textBeforeError.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length;
        
        // Approximate position calculation (this will be approximate)
        const lineHeight = 24; // Estimate based on font size and line height
        const charWidth = 8;  // Estimate of character width in pixels
        
        suggestionsRef.current.style.top = `${textareaRect.top + line * lineHeight - textarea.scrollTop}px`;
        suggestionsRef.current.style.left = `${textareaRect.left + column * charWidth}px`;
      }
    }, 0);
  };

  // Apply spelling suggestion
  const applySuggestion = (suggestion: string) => {
    if (!showSuggestions) return;
    
    const { word, position } = showSuggestions;
    const newText = 
      text.substring(0, position) + 
      suggestion + 
      text.substring(position + word.length);
    
    handleTextChange(newText);
    setShowSuggestions(null);
  };

  // Run spell check with AI
  const runAISpellCheck = async () => {
    setIsGenerating(true);
    
    try {
      const request: AIRequest = {
        mode: 'writing_assistant',
        input: text,
        context: {
          action: 'grammar',
          chapter_id: activeChapterId,
        }
      };
      
      const response = await generateWithAI(request);
      setAiResult(response.result);
      setShowAIPanel(true);
    } catch (error) {
      console.error('Error generating AI content:', error);
      setAiResult('Erro ao verificar ortografia. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick AI actions directly from editor
  const handleQuickAI = async (action: string) => {
    const textarea = document.querySelector('.editor-area') as HTMLTextAreaElement;
    
    if (textarea) {
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      let inputText = '';
      
      // If text is selected, use that; otherwise use the entire content
      if (selectionStart !== selectionEnd) {
        inputText = text.substring(selectionStart, selectionEnd);
      } else {
        inputText = text;
      }
      
      if (!inputText) return;
      
      setIsGenerating(true);
      setAiResult(null);
      
      try {
        const request: AIRequest = {
          mode: 'writing_assistant',
          input: inputText,
          context: {
            action: action,
            chapter_id: activeChapterId,
          }
        };
        
        const response = await generateWithAI(request);
        setAiResult(response.result);
        setShowAIPanel(true);
      } catch (error) {
        console.error('Error generating AI content:', error);
        setAiResult('Erro ao gerar conteúdo. Tente novamente.');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  // Handle AI generation with custom settings
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    setAiResult(null);
    
    try {
      const request: AIRequest = {
        mode: aiMode,
        input: text,
        context: {
          action: aiAction,
          chapter_id: activeChapterId,
        }
      };
      
      const response = await generateWithAI(request);
      
      // Show different data based on the AI mode
      if (aiMode === 'creative_ideas' && response.ideas) {
        setAiResult(response.ideas.join('\n\n'));
      } else if (aiMode === 'search' && response.analysis) {
        setAiResult(response.analysis);
      } else {
        setAiResult(response.result);
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      setAiResult('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI suggestions to the text
  const applyAISuggestion = () => {
    if (aiResult && activeChapterId) {
      const textarea = document.querySelector('.editor-area') as HTMLTextAreaElement;
      
      if (textarea) {
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        
        // If text was selected, replace just that selection; otherwise replace entire content
        if (selectionStart !== selectionEnd) {
          const newText = text.substring(0, selectionStart) + aiResult + text.substring(selectionEnd);
          handleTextChange(newText);
        } else {
          handleTextChange(aiResult);
        }
      }
      
      setAiResult(null);
      setShowAIPanel(false);
    }
  };

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Header */}
      <header className="header">
        <div className="container header-content">
          <h1 className="header-title">Escritor App</h1>
          <div className="header-actions">
            <div className="total-word-count">
              Total: {getTotalWordCount()} palavras
            </div>
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Capítulos</h2>
          <ul className="chapter-list">
            {chapters.map(chapter => (
              <li 
                key={chapter.id}
                className={`chapter-item ${activeChapterId === chapter.id ? 'active' : ''}`}
                onClick={() => setActiveChapterId(chapter.id)}
              >
                <div className="chapter-title">{chapter.title}</div>
                {chapter.lastUpdated && (
                  <div className="chapter-meta">
                    Última atualização: {new Date(chapter.lastUpdated).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button 
            className="add-chapter-btn"
            onClick={addChapter}
          >
            Novo Capítulo
          </button>
        </aside>

        {/* Editor area */}
        <div className="editor-container">
          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button 
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Estatísticas
            </button>
          </div>

          {/* Editor Content */}
          {activeTab === 'editor' && (
            <div className="content-panel">
              <div className="formatting-toolbar">
                <button className="format-btn" title="Negrito" onClick={() => applyFormatting('bold')}>B</button>
                <button className="format-btn" title="Itálico" onClick={() => applyFormatting('italic')}>I</button>
                <button className="format-btn" title="Sublinhado" onClick={() => applyFormatting('underline')}>U</button>
                <span className="toolbar-divider"></span>
                <button className="format-btn" title="Título 1" onClick={() => applyFormatting('heading1')}>H1</button>
                <button className="format-btn" title="Título 2" onClick={() => applyFormatting('heading2')}>H2</button>
                <button className="format-btn" title="Título 3" onClick={() => applyFormatting('heading3')}>H3</button>
                <span className="toolbar-divider"></span>
                <button className="format-btn" title="Citação" onClick={() => applyFormatting('quote')}>"</button>
                <button className="format-btn" title="Lista" onClick={() => applyFormatting('list')}>•</button>
                <span className="toolbar-divider"></span>
                
                {/* Added spell check button */}
                <button 
                  className="ai-toolbar-btn" 
                  title="Verificar ortografia" 
                  onClick={runAISpellCheck}
                  disabled={isGenerating}
                >
                  🔍 Verificar Ortografia
                </button>
                
                <button className="ai-toolbar-btn" title="Melhorar texto" onClick={() => handleQuickAI('improve')}>✨ Melhorar</button>
                <button className="ai-toolbar-btn" title="Expandir texto" onClick={() => handleQuickAI('expand')}>📝 Expandir</button>
                <button 
                  className="ai-toolbar-btn" 
                  title="Configurações avançadas de IA" 
                  onClick={() => setShowAIPanel(!showAIPanel)}
                >
                  🤖 IA Avançada
                </button>
              </div>
              
              <div className="editor-wrapper">
                <textarea
                  ref={editorRef}
                  className="editor-area"
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  onSelect={handleTextSelection}
                  placeholder="Comece a escrever aqui..."
                  spellCheck={false}
                />
              </div>
              
              {/* Spell check suggestions */}
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="spelling-suggestions"
                  style={{
                    position: 'absolute',
                    zIndex: 1000
                  }}
                >
                  {showSuggestions.suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="suggestion-item"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="editor-footer">
                <div className="spellcheck-toolbar">
                  <label className="spellcheck-toggle">
                    <input 
                      type="checkbox" 
                      checked={spellCheckEnabled}
                      onChange={() => setSpellCheckEnabled(!spellCheckEnabled)}
                    />
                    <span>Verificação ortográfica automática</span>
                  </label>
                </div>
                <div className="word-count">
                  Palavras: {wordCount}
                </div>
              </div>
              
              {showAIPanel && (
                <div className="ai-panel">
                  <div className="ai-panel-header">
                    <h3 className="ai-panel-title">Assistente de IA</h3>
                    <button 
                      className="close-panel-btn" 
                      onClick={() => setShowAIPanel(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="ai-panel-content">
                    <div className="form-group">
                      <label className="form-label">Selecione o modo</label>
                      <select 
                        className="form-select"
                        value={aiMode}
                        onChange={(e) => setAiMode(e.target.value as AIRequest['mode'])}
                      >
                        <option value="autocomplete">Autocompletar</option>
                        <option value="generate_page">Gerar Página</option>
                        <option value="writing_assistant">Assistente de Escrita</option>
                        <option value="creative_ideas">Ideias Criativas</option>
                        <option value="search">Busca</option>
                        <option value="custom">Personalizado</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      {aiMode === 'writing_assistant' && (
                        <div>
                          <label className="form-label">O que gostaria de melhorar?</label>
                          <select 
                            className="form-select"
                            value={aiAction}
                            onChange={(e) => setAiAction(e.target.value)}
                          >
                            <option value="improve">Melhorar o texto</option>
                            <option value="simplify">Simplificar</option>
                            <option value="expand">Expandir</option>
                            <option value="professional">Tornar mais profissional</option>
                            <option value="creative">Tornar mais criativo</option>
                            <option value="grammar">Corrigir gramática</option>
                          </select>
                        </div>
                      )}
                      
                      {aiMode === 'creative_ideas' && (
                        <div>
                          <label className="form-label">Tipo de ideia</label>
                          <select 
                            className="form-select"
                            value={aiAction}
                            onChange={(e) => setAiAction(e.target.value)}
                          >
                            <option value="plot_points">Pontos de enredo</option>
                            <option value="characters">Personagens</option>
                            <option value="settings">Cenários</option>
                            <option value="dialogues">Diálogos</option>
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="ai-generate-btn"
                      onClick={handleAIGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                    
                    {aiResult && (
                      <div className="ai-result">
                        <div className="result-content">
                          <h3 className="result-subtitle">Resultado:</h3>
                          <div>{aiResult}</div>
                        </div>
                        
                        {aiMode !== 'creative_ideas' && aiMode !== 'search' && (
                          <button 
                            className="apply-btn"
                            onClick={applyAISuggestion}
                          >
                            Aplicar ao texto
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Content */}
          {activeTab === 'stats' && (
            <div className="content-panel">
              <h2 className="stats-title">Estatísticas</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3 className="stat-title">Palavras neste capítulo</h3>
                  <p className="stat-value">{wordCount}</p>
                </div>
                <div className="stat-card">
                  <h3 className="stat-title">Total de capítulos</h3>
                  <p className="stat-value">{chapters.length}</p>
                </div>
                <div className="stat-card">
                  <h3 className="stat-title">Tempo de leitura (capítulo)</h3>
                  <p className="stat-value">{Math.ceil(wordCount / 200)} min</p>
                </div>
                <div className="stat-card">
                  <h3 className="stat-title">Total de palavras</h3>
                  <p className="stat-value">{getTotalWordCount()}</p>
                </div>
              </div>
              
              <div className="progress-section">
                <h3 className="progress-title">Progresso por capítulo</h3>
                <div className="progress-list">
                  {chapters.map(chapter => {
                    const words = chapter.content.trim().split(/\s+/).filter(word => word.length > 0).length;
                    const progress = Math.min(100, Math.ceil((words / 500) * 100)); // Assuming 500 words is 100%
                    
                    return (
                      <div key={chapter.id} className="progress-item">
                        <div className="progress-header">
                          <span>{chapter.title}</span>
                          <span>{words} palavras</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="footer-text">
            Escritor App &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;