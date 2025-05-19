import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import debounce from 'lodash/debounce';
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  $getRoot,
  $isElementNode,
  UNDO_COMMAND,
  REDO_COMMAND
} from 'lexical';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from '@lexical/list';
import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingTagType
} from '@lexical/rich-text';
import {
  $createQuoteNode,
  $isQuoteNode
} from '@lexical/rich-text';
import {
  TOGGLE_LINK_COMMAND,
  $isLinkNode
} from '@lexical/link';
import styled from 'styled-components';
import {
  $patchStyleText
} from '@lexical/selection';
import { useAutocomplete } from '../../../contexts/AutocompleteContext';
import ImageGenerationModal from '../../ImageGenerationModal';
import { PromptContext } from '../../../services/imageService';

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) => theme.colors.background.paper};
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  height: auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  z-index: 10;
  position: relative;
`;

const ToolbarSection = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-right: 0.75rem;
  padding-right: 0.75rem;
  border-right: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};

  &:last-child {
    border-right: none;
  }
`;

const ToolButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary + '20' : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0 8px;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + '10'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Adicionar um wrapper para agrupar botões de histórico
const HistoryButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  gap: 6px;
`;

// Estilo específico para botões de undo/redo
const HistoryButton = styled(ToolButton)`
  min-width: 28px;
  height: 28px;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0;
  margin: 0;
  background: transparent;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: transparent;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  margin: 0 4px;
`;

const FontSelect = styled.select`
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 0 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 130px;

  &:hover, &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

const BibliotecaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H8V20H4V4Z" fill="currentColor" />
    <path d="M10 4H14V20H10V4Z" fill="currentColor" />
    <path d="M20 4H16V20H20V4Z" fill="currentColor" />
    <path d="M2 2H22V4H21V22H3V4H2V2Z" fill="currentColor" />
  </svg>
);

// Ícones simples para Undo e Redo
const UndoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 11L3 15L7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 15H16C18.7614 15 21 12.7614 21 10V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RedoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 11L21 15L17 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 15H8C5.23858 15 3 12.7614 3 10V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Ícones
const BulletListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6.5C4 7.32843 3.32843 8 2.5 8C1.67157 8 1 7.32843 1 6.5C1 5.67157 1.67157 5 2.5 5C3.32843 5 4 5.67157 4 6.5Z" fill="currentColor"/>
    <path d="M4 12.5C4 13.3284 3.32843 14 2.5 14C1.67157 14 1 13.3284 1 12.5C1 11.6716 1.67157 11 2.5 11C3.32843 11 4 11.6716 4 12.5Z" fill="currentColor"/>
    <path d="M4 18.5C4 19.3284 3.32843 20 2.5 20C1.67157 20 1 19.3284 1 18.5C1 17.6716 1.67157 17 2.5 17C3.32843 17 4 17.6716 4 18.5Z" fill="currentColor"/>
    <path d="M8 6.5C8 6.22386 7.77614 6 7.5 6C7.22386 6 7 6.22386 7 6.5C7 6.77614 7.22386 7 7.5 7C7.77614 7 8 6.77614 8 6.5Z" fill="currentColor"/>
    <path d="M23 6.5C23 6.22386 22.7761 6 22.5 6H7.5C7.22386 6 7 6.22386 7 6.5C7 6.77614 7.22386 7 7.5 7H22.5C22.7761 7 23 6.77614 23 6.5Z" fill="currentColor"/>
    <path d="M23 12.5C23 12.2239 22.7761 12 22.5 12H7.5C7.22386 12 7 12.2239 7 12.5C7 12.7761 7.22386 13 7.5 13H22.5C22.7761 13 23 12.7761 23 12.5Z" fill="currentColor"/>
    <path d="M23 18.5C23 18.2239 22.7761 18 22.5 18H7.5C7.22386 18 7 18.2239 7 18.5C7 18.7761 7.22386 19 7.5 19H22.5C22.7761 19 23 18.7761 23 18.5Z" fill="currentColor"/>
  </svg>
);

const NumberedListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 5.5H3.25V8.5H2.5V6H2V5.5Z" fill="currentColor"/>
    <path d="M4 8.5V8H5V5.5H4.5V5H6V8.5H4Z" fill="currentColor"/>
    <path d="M2 11.5V11H4V10.5H2V10H4.25V9.5H2V9H4.5V12H2V11.5Z" fill="currentColor"/>
    <path d="M2 15.5V15H4V14.5H2V14H4V13.5H2V13H4.5V16H2V15.5Z" fill="currentColor"/>
    <path d="M3.25 16.5H2V19.5H4.5V19H2.5V17H3.25V16.5Z" fill="currentColor"/>
    <path d="M23 6.5C23 6.22386 22.7761 6 22.5 6H7.5C7.22386 6 7 6.22386 7 6.5C7 6.77614 7.22386 7 7.5 7H22.5C22.7761 7 23 6.77614 23 6.5Z" fill="currentColor"/>
    <path d="M23 12.5C23 12.2239 22.7761 12 22.5 12H7.5C7.22386 12 7 12.2239 7 12.5C7 12.7761 7.22386 13 7.5 13H22.5C22.7761 13 23 12.7761 23 12.5Z" fill="currentColor"/>
    <path d="M23 18.5C23 18.2239 22.7761 18 22.5 18H7.5C7.22386 18 7 18.2239 7 18.5C7 18.7761 7.22386 19 7.5 19H22.5C22.7761 19 23 18.7761 23 18.5Z" fill="currentColor"/>
  </svg>
);

const QuoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.3901 7.30021C10.7001 6.70021 9.9101 6.29021 9.0001 6.08021C8.0901 5.87021 7.0101 5.95021 6.1201 6.30021C5.2301 6.65021 4.4101 7.27021 3.9001 8.11021C3.4001 8.95021 3.0901 9.96021 3.0901 11.0002C3.0901 11.2902 3.0901 11.5702 3.1901 11.8502C3.2901 12.1202 3.3901 12.3802 3.5201 12.6502C3.6501 12.9102 3.7901 13.1602 3.9601 13.3802C4.1301 13.6002 4.3101 13.8102 4.5201 14.0002C4.7301 14.1902 4.9401 14.3702 5.1801 14.5202C5.4201 14.6802 5.6601 14.8202 5.9201 14.9502C6.1801 15.0802 6.4501 15.1802 6.7301 15.2802C7.0101 15.3702 7.2901 15.4502 7.5901 15.4902C7.8901 15.5302 8.1901 15.5502 8.5101 15.5502C9.3501 15.5502 10.3201 15.4002 11.2001 14.9402C12.0801 14.4802 12.8501 13.7302 13.3901 12.7602C13.9301 11.7902 14.2001 10.6402 14.2001 9.30021C14.2001 8.60021 14.0901 7.89021 13.7801 7.23021C13.4801 6.56021 13.0001 5.92021 12.3901 5.42021C11.7801 4.92021 11.0801 4.51021 10.3101 4.23021C9.5401 3.96021 8.7201 3.80021 7.9001 3.80021C7.0801 3.80021 6.2601 3.96021 5.5001 4.23021C4.7301 4.50021 4.0301 4.92021 3.4201 5.42021C2.8101 5.92021 2.3201 6.56021 2.0201 7.23021C1.7101 7.89021 1.6001 8.60021 1.6001 9.30021C1.6001 9.37021 1.6001 9.42021 1.6101 9.48021C1.6101 9.54021 1.6201 9.59021 1.6301 9.65021C1.6401 9.70021 1.6601 9.75021 1.6701 9.80021C1.6901 9.85021 1.7101 9.89021 1.7301 9.93021C1.7501 9.98021 1.7801 10.0102 1.8101 10.0402C1.8401 10.0702 1.8701 10.1002 1.9101 10.1202C1.9501 10.1402 1.9901 10.1602 2.0401 10.1702C2.0901 10.1802 2.1301 10.1902 2.1801 10.1902C2.2301 10.1902 2.2701 10.1802 2.3201 10.1702C2.3701 10.1602 2.4101 10.1402 2.4501 10.1202C2.4901 10.1002 2.5201 10.0702 2.5501 10.0402C2.5801 10.0102 2.6101 9.98021 2.6301 9.93021C2.6501 9.89021 2.6701 9.85021 2.6901 9.80021C2.7001 9.75021 2.7201 9.70021 2.7301 9.65021C2.7401 9.59021 2.7501 9.54021 2.7501 9.48021C2.7601 9.42021 2.7601 9.37021 2.7601 9.30021C2.7601 8.89021 2.8301 8.48021 3.0001 8.09021C3.1601 7.71021 3.3901 7.35021 3.7001 7.05021C4.0001 6.75021 4.3601 6.52021 4.7501 6.37021C5.1401 6.22021 5.5701 6.15021 6.0001 6.15021C6.4301 6.15021 6.8501 6.22021 7.2501 6.37021C7.6401 6.52021 8.0001 6.75021 8.3001 7.05021C8.6101 7.35021 8.8401 7.71021 9.0001 8.09021C9.1601 8.48021 9.2401 8.89021 9.2401 9.30021C9.2401 10.1702 9.0801 10.9002 8.8201 11.4802C8.5601 12.0602 8.2301 12.4802 7.8801 12.7702C7.5301 13.0502 7.1301 13.2502 6.8001 13.2502C6.6301 13.2502 6.4701 13.2002 6.3501 13.1202C6.2301 13.0402 6.1401 12.9102 6.0901 12.7302C6.0501 12.6302 6.0301 12.5302 6.0301 12.4202C6.0301 12.3102 6.0601 12.2102 6.1001 12.1102C6.1401 12.0102 6.1901 11.9302 6.2501 11.8502C6.3101 11.7702 6.3701 11.7102 6.4301 11.6602C6.4901 11.6102 6.5401 11.5702 6.5801 11.5402C6.6201 11.5102 6.6401 11.4902 6.6601 11.4802C6.6701 11.4702 6.6801 11.4502 6.6901 11.4402C6.7101 11.4202 6.7201 11.4002 6.7401 11.3702C6.7501 11.3502 6.7601 11.3202 6.7801 11.2902C6.7901 11.2602 6.8001 11.2202 6.8101 11.1902C6.8201 11.1502 6.8201 11.1202 6.8301 11.0802C6.8301 11.0502 6.8401 11.0102 6.8401 10.9802C6.8401 10.6602 6.7801 10.3302 6.6501 10.0302C6.5201 9.73021 6.3401 9.46021 6.1101 9.23021C5.8801 9.00021 5.6101 8.83021 5.3001 8.71021C5.0001 8.60021 4.6701 8.54021 4.3301 8.54021C4.0601 8.54021 3.7801 8.58021 3.5201 8.65021C3.2601 8.72021 3.0001 8.83021 2.7701 8.98021C2.5301 9.13021 2.3301 9.32021 2.1601 9.54021C2.0001 9.76021 1.8701 10.0102 1.7701 10.2702C1.6701 10.5402 1.6301 10.8202 1.6301 11.1202C1.6301 11.2102 1.6301 11.3102 1.6401 11.4002C1.6501 11.4902 1.6701 11.5902 1.6901 11.6802C1.7101 11.7702 1.7401 11.8602 1.7701 11.9502C1.8001 12.0402 1.8401 12.1202 1.8801 12.2102C2.0101 12.4502 2.1701 12.6602 2.3601 12.8502C2.5501 13.0402 2.7601 13.2002 3.0001 13.3302C3.2401 13.4602 3.4901 13.5602 3.7601 13.6302C4.0301 13.7002 4.3001 13.7402 4.5901 13.7402C5.0201 13.7402 5.4201 13.6802 5.7801 13.5602C6.1401 13.4402 6.4601 13.2902 6.7301 13.1002C6.9301 12.9502 7.1101 12.7802 7.2701 12.5902C7.2101 12.7702 7.1601 12.9602 7.1201 13.1602C7.0801 13.3502 7.0601 13.5502 7.0601 13.7502C7.0601 14.0302 7.1201 14.3002 7.2301 14.5502C7.3501 14.8002 7.5101 15.0202 7.7301 15.2002C7.9401 15.3802 8.1901 15.5202 8.4701 15.6202C8.7501 15.7202 9.0401 15.7702 9.3501 15.7702C9.9101 15.7702 10.4401 15.6302 10.9401 15.3502C11.4401 15.0702 11.8801 14.6802 12.2501 14.1902C12.6201 13.7002 12.9201 13.1302 13.1301 12.4802C13.3401 11.8302 13.4601 11.1302 13.4601 10.3702C13.4601 9.90021 13.3701 9.46021 13.2101 9.06021C13.0501 8.66021 12.8301 8.30021 12.5601 7.99021C12.2901 7.68021 11.9701 7.43021 11.6101 7.23021C11.5401 7.24021 11.4601 7.28021 11.3901 7.30021Z" fill="currentColor"/>
    <path d="M13.1201 6.30021C13.4101 6.65021 13.8301 7.27021 14.3401 8.11021C14.8401 8.95021 15.1501 9.96021 15.1501 11.0002C15.1501 11.2902 15.1501 11.5702 15.0501 11.8502C14.9501 12.1202 14.8501 12.3802 14.7201 12.6502C14.5901 12.9102 14.4501 13.1602 14.2801 13.3802C14.1101 13.6002 13.9301 13.8102 13.7201 14.0002C13.5101 14.1902 13.3001 14.3702 13.0601 14.5202C12.8201 14.6802 12.5801 14.8202 12.3201 14.9502C12.0601 15.0802 11.7901 15.1802 11.5101 15.2802C11.2301 15.3702 10.9501 15.4502 10.6501 15.4902C10.3501 15.5302 10.0501 15.5502 9.73005 15.5502C8.89005 15.5502 7.92005 15.4002 7.04005 14.9402C6.16005 14.4802 5.39005 13.7302 4.85005 12.7602C4.31005 11.7902 4.04005 10.6402 4.04005 9.30021C4.04005 8.60021 4.15005 7.89021 4.46005 7.23021C4.76005 6.56021 5.24005 5.92021 5.85005 5.42021C6.46005 4.92021 7.16005 4.51021 7.93005 4.23021C8.70005 3.96021 9.52005 3.80021 10.3401 3.80021C11.1601 3.80021 11.9801 3.96021 12.7401 4.23021C13.5101 4.50021 14.2101 4.92021 14.8201 5.42021C15.4301 5.92021 15.9201 6.56021 16.2201 7.23021C16.5301 7.89021 16.6401 8.60021 16.6401 9.30021C16.6401 9.37021 16.6401 9.42021 16.6301 9.48021C16.6301 9.54021 16.6201 9.59021 16.6101 9.65021C16.6001 9.70021 16.5801 9.75021 16.5701 9.80021C16.5501 9.85021 16.5301 9.89021 16.5101 9.93021C16.4901 9.98021 16.4601 10.0102 16.4301 10.0402C16.4001 10.0702 16.3701 10.1002 16.3301 10.1202C16.2901 10.1402 16.2501 10.1602 16.2001 10.1702C16.1501 10.1802 16.1101 10.1902 16.0601 10.1902C16.0101 10.1902 15.9701 10.1802 15.9201 10.1702C15.8701 10.1602 15.8301 10.1402 15.7901 10.1202C15.7501 10.1002 15.7201 10.0702 15.6901 10.0402C15.6601 10.0102 15.6301 9.98021 15.6101 9.93021C15.5901 9.89021 15.5701 9.85021 15.5501 9.80021C15.5401 9.75021 15.5201 9.70021 15.5101 9.65021C15.5001 9.59021 15.4901 9.54021 15.4901 9.48021C15.4801 9.42021 15.4801 9.37021 15.4801 9.30021C15.4801 8.89021 15.4101 8.48021 15.2401 8.09021C15.0801 7.71021 14.8501 7.35021 14.5401 7.05021C14.2401 6.75021 13.8801 6.52021 13.4901 6.37021C13.1001 6.22021 12.6701 6.15021 12.2401 6.15021C11.8101 6.15021 11.3901 6.22021 10.9901 6.37021C10.6001 6.52021 10.2401 6.75021 9.94005 7.05021C9.63005 7.35021 9.40005 7.71021 9.24005 8.09021C9.08005 8.48021 9.00005 8.89021 9.00005 9.30021C9.00005 10.1702 9.16005 10.9002 9.42005 11.4802C9.68005 12.0602 10.0101 12.4802 10.3601 12.7702C10.7101 13.0502 11.1101 13.2502 11.4401 13.2502C11.6101 13.2502 11.7701 13.2002 11.8901 13.1202C12.0101 13.0402 12.1001 12.9102 12.1501 12.7302C12.1901 12.6302 12.2101 12.5302 12.2101 12.4202C12.2101 12.3102 12.1801 12.2102 12.1401 12.1102C12.1001 12.0102 12.0501 11.9302 11.9901 11.8502C11.9301 11.7702 11.8701 11.7102 11.8101 11.6602C11.7501 11.6102 11.7001 11.5702 11.6601 11.5402C11.6201 11.5102 11.6001 11.4902 11.5801 11.4802C11.5701 11.4702 11.5601 11.4502 11.5501 11.4402C11.5301 11.4202 11.5201 11.4002 11.5001 11.3702C11.4901 11.3502 11.4801 11.3202 11.4601 11.2902C11.4501 11.2602 11.4401 11.2202 11.4301 11.1902C11.4201 11.1502 11.4201 11.1202 11.4101 11.0802C11.4101 11.0502 11.4001 11.0102 11.4001 10.9802C11.4001 10.6602 11.4601 10.3302 11.5901 10.0302C11.7201 9.73021 11.9001 9.46021 12.1301 9.23021C12.3601 9.00021 12.6301 8.83021 12.9401 8.71021C13.2501 8.60021 13.5701 8.54021 13.9101 8.54021C14.1801 8.54021 14.4601 8.58021 14.7201 8.65021C14.9801 8.72021 15.2401 8.83021 15.4701 8.98021C15.7101 9.13021 15.9101 9.32021 16.0801 9.54021C16.2401 9.76021 16.3701 10.0102 16.4701 10.2702C16.5701 10.5402 16.6101 10.8202 16.6101 11.1202C16.6101 11.2102 16.6101 11.3102 16.6001 11.4002C16.5901 11.4902 16.5701 11.5902 16.5501 11.6802C16.5301 11.7702 16.5001 11.8602 16.4701 11.9502C16.4401 12.0402 16.4001 12.1202 16.3601 12.2102C16.2301 12.4502 16.0701 12.6602 15.8801 12.8502C15.6901 13.0402 15.4801 13.2002 15.2401 13.3302C15.0001 13.4602 14.7501 13.5602 14.4801 13.6302C14.2101 13.7002 13.9401 13.7402 13.6501 13.7402C13.2201 13.7402 12.8201 13.6802 12.4601 13.5602C12.1001 13.4402 11.7801 13.2902 11.5101 13.1002C11.3101 12.9502 11.1301 12.7802 10.9701 12.5902C11.0301 12.7702 11.0801 12.9602 11.1201 13.1602C11.1601 13.3502 11.1801 13.5502 11.1801 13.7502C11.1801 14.0302 11.1201 14.3002 11.0101 14.5502C10.8901 14.8002 10.7301 15.0202 10.5101 15.2002C10.3001 15.3802 10.0501 15.5202 9.77005 15.6202C9.49005 15.7202 9.20005 15.7702 8.89005 15.7702C8.33005 15.7702 7.80005 15.6302 7.30005 15.3502C6.80005 15.0702 6.36005 14.6802 5.99005 14.1902C5.62005 13.7002 5.32005 13.1302 5.11005 12.4802C4.90005 11.8302 4.78005 11.1302 4.78005 10.3702C4.78005 9.90021 4.87005 9.46021 5.03005 9.06021C5.19005 8.66021 5.41005 8.30021 5.68005 7.99021C5.95005 7.68021 6.27005 7.43021 6.63005 7.23021C6.70005 7.24021 6.78005 7.28021 6.85005 7.30021C7.54005 6.70021 8.33005 6.29021 9.24005 6.08021C10.1501 5.87021 11.2301 5.95021 12.1201 6.30021Z" fill="currentColor"/>
    <path d="M13.1201 6.30021C13.4101 6.65021 13.8301 7.27021 14.3401 8.11021C14.8401 8.95021 15.1501 9.96021 15.1501 11.0002C15.1501 11.2902 15.1501 11.5702 15.0501 11.8502C14.9501 12.1202 14.8501 12.3802 14.7201 12.6502C14.5901 12.9102 14.4501 13.1602 14.2801 13.3802C14.1101 13.6002 13.9301 13.8102 13.7201 14.0002C13.5101 14.1902 13.3001 14.3702 13.0601 14.5202C12.8201 14.6802 12.5801 14.8202 12.3201 14.9502C12.0601 15.0802 11.7901 15.1802 11.5101 15.2802C11.2301 15.3702 10.9501 15.4502 10.6501 15.4902C10.3501 15.5302 10.0501 15.5502 9.73005 15.5502C8.89005 15.5502 7.92005 15.4002 7.04005 14.9402C6.16005 14.4802 5.39005 13.7302 4.85005 12.7602C4.31005 11.7902 4.04005 10.6402 4.04005 9.30021C4.04005 8.60021 4.15005 7.89021 4.46005 7.23021C4.76005 6.56021 5.24005 5.92021 5.85005 5.42021C6.46005 4.92021 7.16005 4.51021 7.93005 4.23021C8.70005 3.96021 9.52005 3.80021 10.3401 3.80021C11.1601 3.80021 11.9801 3.96021 12.7401 4.23021C13.5101 4.50021 14.2101 4.92021 14.8201 5.42021C15.4301 5.92021 15.9201 6.56021 16.2201 7.23021C16.5301 7.89021 16.6401 8.60021 16.6401 9.30021C16.6401 9.37021 16.6401 9.42021 16.6301 9.48021C16.6301 9.54021 16.6201 9.59021 16.6101 9.65021C16.6001 9.70021 16.5801 9.75021 16.5701 9.80021C16.5501 9.85021 16.5301 9.89021 16.5101 9.93021C16.4901 9.98021 16.4601 10.0102 16.4301 10.0402C16.4001 10.0702 16.3701 10.1002 16.3301 10.1202C16.2901 10.1402 16.2501 10.1602 16.2001 10.1702C16.1501 10.1802 16.1101 10.1902 16.0601 10.1902C16.0101 10.1902 15.9701 10.1802 15.9201 10.1702C15.8701 10.1602 15.8301 10.1402 15.7901 10.1202C15.7501 10.1002 15.7201 10.0702 15.6901 10.0402C15.6601 10.0102 15.6301 9.98021 15.6101 9.93021C15.5901 9.89021 15.5701 9.85021 15.5501 9.80021C15.5401 9.75021 15.5201 9.70021 15.5101 9.65021C15.5001 9.59021 15.4901 9.54021 15.4901 9.48021C15.4801 9.42021 15.4801 9.37021 15.4801 9.30021C15.4801 8.89021 15.4101 8.48021 15.2401 8.09021C15.0801 7.71021 14.8501 7.35021 14.5401 7.05021C14.2401 6.75021 13.8801 6.52021 13.4901 6.37021C13.1001 6.22021 12.6701 6.15021 12.2401 6.15021C11.8101 6.15021 11.3901 6.22021 10.9901 6.37021C10.6001 6.52021 10.2401 6.75021 9.94005 7.05021C9.63005 7.35021 9.40005 7.71021 9.24005 8.09021C9.08005 8.48021 9.00005 8.89021 9.00005 9.30021C9.00005 10.1702 9.16005 10.9002 9.42005 11.4802C9.68005 12.0602 10.0101 12.4802 10.3601 12.7702C10.7101 13.0502 11.1101 13.2502 11.4401 13.2502C11.6101 13.2502 11.7701 13.2002 11.8901 13.1202C12.0101 13.0402 12.1001 12.9102 12.1501 12.7302C12.1901 12.6302 12.2101 12.5302 12.2101 12.4202C12.2101 12.3102 12.1801 12.2102 12.1401 12.1102C12.1001 12.0102 12.0501 11.9302 11.9901 11.8502C11.9301 11.7702 11.8701 11.7102 11.8101 11.6602C11.7501 11.6102 11.7001 11.5702 11.6601 11.5402C11.6201 11.5102 11.6001 11.4902 11.5801 11.4802C11.5701 11.4702 11.5601 11.4502 11.5501 11.4402C11.5301 11.4202 11.5201 11.4002 11.5001 11.3702C11.4901 11.3502 11.4801 11.3202 11.4601 11.2902C11.4501 11.2602 11.4401 11.2202 11.4301 11.1902C11.4201 11.1502 11.4201 11.1202 11.4101 11.0802C11.4101 11.0502 11.4001 11.0102 11.4001 10.9802C11.4001 10.6602 11.4601 10.3302 11.5901 10.0302C11.7201 9.73021 11.9001 9.46021 12.1301 9.23021C12.3601 9.00021 12.6301 8.83021 12.9401 8.71021C13.2501 8.60021 13.5701 8.54021 13.9101 8.54021C14.1801 8.54021 14.4601 8.58021 14.7201 8.65021C14.9801 8.72021 15.2401 8.83021 15.4701 8.98021C15.7101 9.13021 15.9101 9.32021 16.0801 9.54021C16.2401 9.76021 16.3701 10.0102 16.4701 10.2702C16.5701 10.5402 16.6101 10.8202 16.6101 11.1202C16.6101 11.2102 16.6101 11.3102 16.6001 11.4002C16.5901 11.4902 16.5701 11.5902 16.5501 11.6802C16.5301 11.7702 16.5001 11.8602 16.4701 11.9502C16.4401 12.0402 16.4001 12.1202 16.3601 12.2102C16.2301 12.4502 16.0701 12.6602 15.8801 12.8502C15.6901 13.0402 15.4801 13.2002 15.2401 13.3302C15.0001 13.4602 14.7501 13.5602 14.4801 13.6302C14.2101 13.7002 13.9401 13.7402 13.6501 13.7402C13.2201 13.7402 12.8201 13.6802 12.4601 13.5602C12.1001 13.4402 11.7801 13.2902 11.5101 13.1002C11.3101 12.9502 11.1301 12.7802 10.9701 12.5902C11.0301 12.7702 11.0801 12.9602 11.1201 13.1602C11.1601 13.3502 11.1801 13.5502 11.1801 13.7502C11.1801 14.0302 11.1201 14.3002 11.0101 14.5502C10.8901 14.8002 10.7301 15.0202 10.5101 15.2002C10.3001 15.3802 10.0501 15.5202 9.77005 15.6202C9.49005 15.7202 9.20005 15.7702 8.89005 15.7702C8.33005 15.7702 7.80005 15.6302 7.30005 15.3502C6.80005 15.0702 6.36005 14.6802 5.99005 14.1902C5.62005 13.7002 5.32005 13.1302 5.11005 12.4802C4.90005 11.8302 4.78005 11.1302 4.78005 10.3702C4.78005 9.90021 4.87005 9.46021 5.03005 9.06021C5.19005 8.66021 5.41005 8.30021 5.68005 7.99021C5.95005 7.68021 6.27005 7.43021 6.63005 7.23021C6.70005 7.24021 6.78005 7.28021 6.85005 7.30021C7.54005 6.70021 8.33005 6.29021 9.24005 6.08021C10.1501 5.87021 11.2301 5.95021 12.1201 6.30021Z" fill="currentColor"/>
    <path d="M13.1201 6.30021C13.4101 6.65021 13.8301 7.27021 14.3401 8.11021C14.8401 8.95021 15.1501 9.96021 15.1501 11.0002C15.1501 11.2902 15.1501 11.5702 15.0501 11.8502C14.9501 12.1202 14.8501 12.3802 14.7201 12.6502C14.5901 12.9102 14.4501 13.1602 14.2801 13.3802C14.1101 13.6002 13.9301 13.8102 13.7201 14.0002C13.5101 14.1902 13.3001 14.3702 13.0601 14.5202C12.8201 14.6802 12.5801 14.8202 12.3201 14.9502C12.0601 15.0802 11.7901 15.1802 11.5101 15.2802C11.2301 15.3702 10.9501 15.4502 10.6501 15.4902C10.3501 15.5302 10.0501 15.5502 9.73005 15.5502C8.89005 15.5502 7.92005 15.4002 7.04005 14.9402C6.16005 14.4802 5.39005 13.7302 4.85005 12.7602C4.31005 11.7902 4.04005 10.6402 4.04005 9.30021C4.04005 8.60021 4.15005 7.89021 4.46005 7.23021C4.76005 6.56021 5.24005 5.92021 5.85005 5.42021C6.46005 4.92021 7.16005 4.51021 7.93005 4.23021C8.70005 3.96021 9.52005 3.80021 10.3401 3.80021C11.1601 3.80021 11.9801 3.96021 12.7401 4.23021C13.5101 4.50021 14.2101 4.92021 14.8201 5.42021C15.4301 5.92021 15.9201 6.56021 16.2201 7.23021C16.5301 7.89021 16.6401 8.60021 16.6401 9.30021C16.6401 9.37021 16.6401 9.42021 16.6301 9.48021C16.6301 9.54021 16.6201 9.59021 16.6101 9.65021C16.6001 9.70021 16.5801 9.75021 16.5701 9.80021C16.5501 9.85021 16.5301 9.89021 16.5101 9.93021C16.4901 9.98021 16.4601 10.0102 16.4301 10.0402C16.4001 10.0702 16.3701 10.1002 16.3301 10.1202C16.2901 10.1402 16.2501 10.1602 16.2001 10.1702C16.1501 10.1802 16.1101 10.1902 16.0601 10.1902C16.0101 10.1902 15.9701 10.1802 15.9201 10.1702C15.8701 10.1602 15.8301 10.1402 15.7901 10.1202C15.7501 10.1002 15.7201 10.0702 15.6901 10.0402C15.6601 10.0102 15.6301 9.98021 15.6101 9.93021C15.5901 9.89021 15.5701 9.85021 15.5501 9.80021C15.5401 9.75021 15.5201 9.70021 15.5101 9.65021C15.5001 9.59021 15.4901 9.54021 15.4901 9.48021C15.4801 9.42021 15.4801 9.37021 15.4801 9.30021C15.4801 8.89021 15.4101 8.48021 15.2401 8.09021C15.0801 7.71021 14.8501 7.35021 14.5401 7.05021C14.2401 6.75021 13.8801 6.52021 13.4901 6.37021C13.1001 6.22021 12.6701 6.15021 12.2401 6.15021C11.8101 6.15021 11.3901 6.22021 10.9901 6.37021C10.6001 6.52021 10.2401 6.75021 9.94005 7.05021C9.63005 7.35021 9.40005 7.71021 9.24005 8.09021C9.08005 8.48021 9.00005 8.89021 9.00005 9.30021C9.00005 10.1702 9.16005 10.9002 9.42005 11.4802C9.68005 12.0602 10.0101 12.4802 10.3601 12.7702C10.7101 13.0502 11.1101 13.2502 11.4401 13.2502C11.6101 13.2502 11.7701 13.2002 11.8901 13.1202C12.0101 13.0402 12.1001 12.9102 12.1501 12.7302C12.1901 12.6302 12.2101 12.5302 12.2101 12.4202C12.2101 12.3102 12.1801 12.2102 12.1401 12.1102C12.1001 12.0102 12.0501 11.9302 11.9901 11.8502C11.9301 11.7702 11.8701 11.7102 11.8101 11.6602C11.7501 11.6102 11.7001 11.5702 11.6601 11.5402C11.6201 11.5102 11.6001 11.4902 11.5801 11.4802C11.5701 11.4702 11.5601 11.4502 11.5501 11.4402C11.5301 11.4202 11.5201 11.4002 11.5001 11.3702C11.4901 11.3502 11.4801 11.3202 11.4601 11.2902C11.4501 11.2602 11.4401 11.2202 11.4301 11.1902C11.4201 11.1502 11.4201 11.1202 11.4101 11.0802C11.4101 11.0502 11.4001 11.0102 11.4001 10.9802C11.4001 10.6602 11.4601 10.3302 11.5901 10.0302C11.7201 9.73021 11.9001 9.46021 12.1301 9.23021C12.3601 9.00021 12.6301 8.83021 12.9401 8.71021C13.2501 8.60021 13.5701 8.54021 13.9101 8.54021C14.1801 8.54021 14.4601 8.58021 14.7201 8.65021C14.9801 8.72021 15.2401 8.83021 15.4701 8.98021C15.7101 9.13021 15.9101 9.32021 16.0801 9.54021C16.2401 9.76021 16.3701 10.0102 16.4701 10.2702C16.5701 10.5402 16.6101 10.8202 16.6101 11.1202C16.6101 11.2102 16.6101 11.3102 16.6001 11.4002C16.5901 11.4902 16.5701 11.5902 16.5501 11.6802C16.5301 11.7702 16.5001 11.8602 16.4701 11.9502C16.4401 12.0402 16.4001 12.1202 16.3601 12.2102C16.2301 12.4502 16.0701 12.6602 15.8801 12.8502C15.6901 13.0402 15.4801 13.2002 15.2401 13.3302C15.0001 13.4602 14.7501 13.5602 14.4801 13.6302C14.2101 13.7002 13.9401 13.7402 13.6501 13.7402C13.2201 13.7402 12.8201 13.6802 12.4601 13.5602C12.1001 13.4402 11.7801 13.2902 11.5101 13.1002C11.3101 12.9502 11.1301 12.7802 10.9701 12.5902C11.0301 12.7702 11.0801 12.9602 11.1201 13.1602C11.1601 13.3502 11.1801 13.5502 11.1801 13.7502C11.1801 14.0302 11.1201 14.3002 11.0101 14.5502C10.8901 14.8002 10.7301 15.0202 10.5101 15.2002C10.3001 15.3802 10.0501 15.5202 9.77005 15.6202C9.49005 15.7202 9.20005 15.7702 8.89005 15.7702C8.33005 15.7702 7.80005 15.6302 7.30005 15.3502C6.80005 15.0702 6.36005 14.6802 5.99005 14.1902C5.62005 13.7002 5.32005 13.1302 5.11005 12.4802C4.90005 11.8302 4.78005 11.1302 4.78005 10.3702C4.78005 9.90021 4.87005 9.46021 5.03005 9.06021C5.19005 8.66021 5.41005 8.30021 5.68005 7.99021C5.95005 7.68021 6.27005 7.43021 6.63005 7.23021C6.70005 7.24021 6.78005 7.28021 6.85005 7.30021C7.54005 6.70021 8.33005 6.29021 9.24005 6.08021C10.1501 5.87021 11.2301 5.95021 12.1201 6.30021Z" fill="currentColor"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.8284 12L16.2426 13.4142L19.071 10.5858C20.6331 9.02365 20.6331 6.49099 19.071 4.9289C17.509 3.3668 14.9763 3.3668 13.4142 4.9289L10.5858 7.75732L12 9.17154L14.8284 6.34311C15.6095 5.56206 16.8758 5.56206 17.6568 6.34311C18.4379 7.12416 18.4379 8.39049 17.6568 9.17154L14.8284 12Z" fill="currentColor"/>
    <path d="M12 14.8285L10.5858 13.4142L7.75736 16.2427C6.1953 17.8047 6.1953 20.3374 7.75736 21.8995C9.31941 23.4615 11.8521 23.4615 13.4142 21.8995L16.2426 19.0711L14.8284 17.6569L12 20.4853C11.219 21.2664 9.95265 21.2664 9.17159 20.4853C8.39053 19.7043 8.39053 18.4379 9.17159 17.6569L12 14.8285Z" fill="currentColor"/>
    <path d="M14.8285 10.5857C15.219 10.1952 15.219 9.56199 14.8285 9.17157C14.4379 8.78105 13.8048 8.78105 13.4142 9.17157L9.17155 13.4143C8.78103 13.8048 8.78103 14.438 9.17155 14.8284C9.56207 15.219 10.1952 15.219 10.5857 14.8284L14.8285 10.5857Z" fill="currentColor"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M9 15L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
    <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/>
  </svg>
);

const AutocompleteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12h10M16 12h6M2 6h18M2 18h6M12 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17.5 15.5l2.5 2.5l-2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<'paragraph' | HeadingTagType | 'quote'>('paragraph');
  const [isLink, setIsLink] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>('inherit');
  const debouncedUpdateRef = useRef<any>(null);
  const initialLoadComplete = useRef<boolean>(false);
  const { isAutocompleteEnabled, toggleAutocomplete } = useAutocomplete();

  // Função para detectar a fonte predominante no documento
  const detectInitialFont = useCallback(() => {
    try {
      editor.update(() => {
        const root = $getRoot();
        const children = root.getChildren();
        
        // Mapa para contar ocorrências de cada fonte
        const fontCounts: Record<string, number> = {};
        let maxCount = 0;
        let predominantFont = 'inherit';
        
        // Função recursiva para processar nós
        const processNode = (node: any) => {
          // Verificar se o nó tem estilo
          if (node.getTextContent && node.getTextContent().length > 0) {
            // Tentar obter estilo diretamente do nó
            const style = node.getStyle?.() || '';
            const textStyle = node.getTextStyle?.() || '';
            
            // Tentar extrair font-family
            let fontFamily = '';
            if (style.includes('font-family:')) {
              fontFamily = style.match(/font-family:\s*([^;]+);?/)?.[1] || '';
            } else if (textStyle.includes('font-family:')) {
              fontFamily = textStyle.match(/font-family:\s*([^;]+);?/)?.[1] || '';
            }
            
            if (fontFamily) {
              fontCounts[fontFamily] = (fontCounts[fontFamily] || 0) + 1;
              if (fontCounts[fontFamily] > maxCount) {
                maxCount = fontCounts[fontFamily];
                predominantFont = fontFamily;
              }
            }
          }
          
          // Processar filhos recursivamente
          if (node.getChildren) {
            const children = node.getChildren();
            children.forEach(processNode);
          }
        };
        
        // Processar todos os nós filhos da raiz
        children.forEach(processNode);
        
        // Verificar se encontramos uma fonte predominante
        if (predominantFont !== 'inherit' && !initialLoadComplete.current) {
          // Limpar a fonte (remover aspas extras)
          predominantFont = predominantFont.replace(/^['"]|['"]$/g, '');
          
          // Encontrar a fonte correspondente no nosso dropdown
          const options = [
            'inherit',
            "'Times New Roman', serif",
            "Arial, sans-serif",
            "Georgia, serif",
            "'Courier New', monospace",
            "'Trebuchet MS', sans-serif",
            "Verdana, sans-serif",
            "'Palatino Linotype', serif"
          ];
          
          for (const option of options) {
            if (option.includes(predominantFont)) {
              // Atualizar o estado da fonte depois do timeout 
              // para garantir que ocorra após a renderização
              setTimeout(() => {
                setFontFamily(option);
                initialLoadComplete.current = true;
              }, 100);
              break;
            }
          }
        }
      });
    } catch (error) {
      console.error('Erro ao detectar fonte inicial:', error);
    }
  }, [editor]);

  // Executar a detecção de fonte na inicialização
  useEffect(() => {
    // Esperar um pouco para o editor carregar o conteúdo
    const timeout = setTimeout(() => {
      if (!initialLoadComplete.current) {
        detectInitialFont();
      }
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [detectInitialFont]);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Detectar a fonte atual
      try {
        // Tenta obter o style do elemento atual
        const nodes = selection.getNodes();
        if (nodes.length > 0) {
          const node = nodes[0];
          const element = editor.getElementByKey(node.getKey());
          
          if (element) {
            // Veja se há um estilo de font-family definido
            const style = window.getComputedStyle(element);
            const font = style.getPropertyValue('font-family');
            if (font) {
              // Verificar se a fonte corresponde a alguma das nossas opções
              const options = [
                'inherit',
                "'Times New Roman', serif",
                "Arial, sans-serif",
                "Georgia, serif",
                "'Courier New', monospace",
                "'Trebuchet MS', sans-serif",
                "Verdana, sans-serif",
                "'Palatino Linotype', serif"
              ];
              
              // Procurar por uma correspondência aproximada
              const matchedFont = options.find(opt => 
                font.includes(opt.replace(/[']/g, '').split(',')[0])
              );
              
              if (matchedFont) {
                setFontFamily(matchedFont);
              }
            }
          }
        }
      } catch (error) {
        console.log('Erro ao detectar fonte:', error);
      }

      const anchorNode = selection.anchor.getNode();
      let element = anchorNode;

      // Verificar com segurança se podemos obter o elemento de nível superior
      try {
        if (anchorNode.getKey() !== 'root') {
          element = anchorNode.getTopLevelElementOrThrow();
        }
      } catch (error) {
        // Falha silenciosa, mantenha o nó de âncora
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // Find nearest parent list element mais segura
      let parentList = element;
      try {
        if ($isListNode(element)) {
          parentList = element;
        } else if (anchorNode.getKey() !== 'root') {
          const parent = anchorNode.getParent();
          if (parent && parent.getKey() !== 'root') {
            parentList = parent.getTopLevelElementOrThrow();
          }
        }
      } catch (error) {
        // Falha silenciosa
      }

      setIsBulletList(
        $isListNode(parentList) && parentList.getListType() === 'bullet'
      );
      setIsNumberedList(
        $isListNode(parentList) && parentList.getListType() === 'number'
      );

      // Check if it's a link com verificação segura
      const parent = anchorNode.getParent();
      setIsLink(
        $isLinkNode(anchorNode) ||
        (parent ? $isLinkNode(parent) : false)
      );

      if (elementDOM !== null) {
        if ($isHeadingNode(element)) {
          const tag = element.getTag();
          setBlockType(tag);
        } else if ($isQuoteNode(element)) {
          setBlockType('quote');
        } else {
          setBlockType('paragraph');
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    // Função para criar o debounce
    const createDebouncedUpdate = () => {
      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current.cancel();
      }
      
      // Criar um novo debounce que atualiza a barra de ferramentas
      const debouncedFn = debounce(() => {
        try {
          updateToolbar();
        } catch (error) {
          console.error('Erro ao atualizar toolbar:', error);
        }
      }, 200);
      
      debouncedUpdateRef.current = debouncedFn;
      return debouncedFn;
    };
    
    // Criar o debounce inicial
    const debouncedUpdate = createDebouncedUpdate();
    
    // Registrar listener para atualizações do editor
    const unregisterListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        debouncedUpdate();
      });
    });
    
    // Limpar na desmontagem
    return () => {
      unregisterListener();
      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current.cancel();
      }
    };
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType === headingSize) {
      // Convert heading to paragraph if already this heading type
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isHeadingNode(parent)) {
              const paragraphNode = $createParagraphNode();
              parent.replace(paragraphNode);
              paragraphNode.append(node);
            }
          });
        }
      });
    } else {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isElementNode(parent)) {
              const headingNode = $createHeadingNode(headingSize);
              parent.replace(headingNode);
              headingNode.append(node);
            }
          });
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType === 'quote') {
      // Remove quote formatting
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isQuoteNode(parent)) {
              const paragraphNode = $createParagraphNode();
              parent.replace(paragraphNode);
              paragraphNode.append(node);
            }
          });
        }
      });
    } else {
      // Apply quote formatting
      // Vamos criar manualmente um QuoteNode ao invés de usar o comando
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach(node => {
            const parent = node.getParent();
            if (parent && $isElementNode(parent)) {
              const quoteNode = $createQuoteNode();
              parent.replace(quoteNode);
              quoteNode.append(node);
            }
          });
        }
      });
    }
  };

  const insertLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = prompt('Enter URL');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    }
  };

  // Estado para controlar o modal de geração de imagem
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageContext, setImageContext] = useState<PromptContext | undefined>(undefined);
  
  // Manipular inserção de imagem
  const insertImage = () => {
    // Abrir o modal de geração de imagem ao invés de usar prompt
    const selection = editor.getEditorState().read($getSelection);
    
    // Capturar texto selecionado se houver para melhorar o prompt da imagem
    let selectedText = '';
    if ($isRangeSelection(selection)) {
      selectedText = selection.getTextContent();
    }
    
    setImageContext({
      texto: selectedText,
      tipo: 'capitulo' as 'capitulo' | 'capa'
    });
    setIsGeneratingImage(true);
  };
  
  // Selecionar imagem gerada
  const handleSelectImage = (imageUrl: string) => {
    // Usamos um evento personalizado já que não podemos importar o comando diretamente
    // Isso será capturado pelo plugin de imagem
    const insertImageEvent = new CustomEvent('lexical-insert-image', {
      detail: { src: imageUrl, altText: 'Imagem gerada por IA' }
    });
    window.dispatchEvent(insertImageEvent);
    setIsGeneratingImage(false);
  };

  const updateFontFamily = (fontFamily: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          'font-family': fontFamily,
        });
      }
    });
  };

  return (
    <Toolbar>
      <HistoryButtonsWrapper>
        <HistoryButton
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          title="Desfazer (Ctrl+Z)"
        >
          <UndoIcon />
        </HistoryButton>
        <HistoryButton
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          title="Refazer (Ctrl+Shift+Z)"
        >
          <RedoIcon />
        </HistoryButton>
      </HistoryButtonsWrapper>

      <ToolbarSection>
        <ToolButton
          $active={isBold}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          title="Bold"
        >
          <strong>B</strong>
        </ToolButton>
        <ToolButton
          $active={isItalic}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolButton>
        <ToolButton
          $active={isUnderline}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
          title="Underline"
        >
          <u>U</u>
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <FontSelect 
          value={fontFamily} 
          onChange={(e) => {
            const newFont = e.target.value;
            setFontFamily(newFont);
            updateFontFamily(newFont);
          }}
        >
          <option value="inherit">Fonte padrão</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="'Palatino Linotype', serif">Palatino</option>
        </FontSelect>
        <ToolButton
          $active={blockType === 'h1'}
          onClick={() => formatHeading('h1')}
          title="Heading 1"
        >
          H1
        </ToolButton>
        <ToolButton
          $active={blockType === 'h2'}
          onClick={() => formatHeading('h2')}
          title="Heading 2"
        >
          H2
        </ToolButton>
        <ToolButton
          $active={blockType === 'h3'}
          onClick={() => formatHeading('h3')}
          title="Heading 3"
        >
          H3
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <ToolButton
          $active={isBulletList}
          onClick={() => {
            if (isBulletList) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            }
          }}
          title="Lista com marcadores"
        >
          <BulletListIcon />
        </ToolButton>
        <ToolButton
          $active={isNumberedList}
          onClick={() => {
            if (isNumberedList) {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
            } else {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            }
          }}
          title="Lista numerada"
        >
          <NumberedListIcon />
        </ToolButton>
      </ToolbarSection>

      <ToolbarSection>
        <ToolButton
          $active={blockType === 'quote'}
          onClick={formatQuote}
          title="Citação"
        >
          <QuoteIcon />
        </ToolButton>
        <ToolButton
          $active={isLink}
          onClick={insertLink}
          title="Link"
        >
          <LinkIcon />
        </ToolButton>
        <ToolButton
          onClick={insertImage}
          title="Inserir imagem"
        >
          <ImageIcon />
        </ToolButton>
      </ToolbarSection>

      {/* Nova seção para o botão de autocomplete */}
      <ToolbarSection>
        <ToolButton
          $active={isAutocompleteEnabled}
          onClick={toggleAutocomplete}
          title={isAutocompleteEnabled ? "Desativar autocomplete" : "Ativar autocomplete"}
        >
          <AutocompleteIcon />
        </ToolButton>
      </ToolbarSection>
    </Toolbar>
  );
};

// Componente separado para renderizar o modal fora do componente principal
export const ToolbarWithModal = () => {
  const [editor] = useLexicalComposerContext();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageContext, setImageContext] = useState<PromptContext | undefined>(undefined);
  
  return (
    <>
      <ToolbarPlugin />
      <ImageGenerationModal
        isOpen={isGeneratingImage}
        onClose={() => setIsGeneratingImage(false)}
        onImageSelect={(url) => {
          // Inserir imagem no editor
          const insertImageEvent = new CustomEvent('lexical-insert-image', {
            detail: { src: url, altText: 'Imagem gerada por IA' }
          });
          window.dispatchEvent(insertImageEvent);
          setIsGeneratingImage(false);
        }}
        context={imageContext}
        initialPrompt=""
      />
    </>
  );
};