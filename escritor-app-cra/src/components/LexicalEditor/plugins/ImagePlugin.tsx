import React, { useEffect, ReactElement } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalNode,
  LexicalEditor,
  NodeKey,
  $getNodeByKey,
  createEditor,
  DecoratorNode,
  SerializedLexicalNode,
  Spread
} from 'lexical';

// Tipo para as props do componente de imagem
interface ImageComponentProps {
  src: string;
  altText: string;
  nodeKey: string;
  width?: number;
  height?: number;
}

// Componente React que renderiza a imagem
function ImageComponent({ src, altText, nodeKey, width, height }: ImageComponentProps) {
  const [editor] = useLexicalComposerContext();
  const [selected, setSelected] = React.useState(false);
  
  // Estilo para o componente de imagem
  const imageStyle: React.CSSProperties = {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '500px',
    margin: '0 auto 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    cursor: 'default',
    position: 'relative',
    width: width ? `${width}px` : undefined,
    height: height ? `${height}px` : undefined,
    border: selected ? '2px solid #3b82f6' : 'none'
  };
  
  // Container
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    maxWidth: '100%',
    margin: '1.5rem 0',
    display: 'inline-block'
  };
  
  return (
    <div style={containerStyle}>
      <img
        src={src}
        alt={altText}
        style={imageStyle}
        onClick={() => {
          setSelected(!selected);
        }}
      />
    </div>
  );
}

// Interface para o nó de imagem serializado
interface SerializedImageNode extends Spread<SerializedLexicalNode, object> {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  type: 'image';
  version: 1;
}

// Função helper para verificar se é um ImageNode
export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

// Classe do nó decorador para imagens
export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;
  
  static getType(): string {
    return 'image';
  }
  
  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key
    );
  }
  
  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }
  
  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.style.display = 'contents';
    return div;
  }
  
  updateDOM(): false {
    return false;
  }
  
  setWidthAndHeight(width?: number, height?: number) {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }
  
  decorate(): ReactElement {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.__key}
      />
    );
  }
  
  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    console.log('ImageNode.importJSON chamado:', serializedNode);
    const { src, altText, width, height } = serializedNode;
    const node = new ImageNode(src, altText, width, height);
    console.log('ImageNode criado:', node);
    return node;
  }
  
  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: 'image',
      version: 1
    };
  }
}

// Plugin de imagem principal
export default function ImagePlugin(): ReactElement | null {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Registrar o manipulador de eventos para inserir imagens
    const handleInsertImage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { src, altText } = customEvent.detail;
      
      editor.update(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          // Criar o nó de imagem e inseri-lo
          const imageNode = new ImageNode(src, altText);
          selection.insertNodes([imageNode]);
          
          // Criar um parágrafo após a imagem
          const paragraph = $createParagraphNode();
          selection.insertNodes([paragraph]);
        }
      });
    };
    
    // Adicionar o event listener
    window.addEventListener('lexical-insert-image', handleInsertImage as EventListener);
    
    // Limpar o event listener quando o componente for desmontado
    return () => {
      window.removeEventListener('lexical-insert-image', handleInsertImage as EventListener);
    };
  }, [editor]);
  
  return null;
}