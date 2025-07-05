declare module 'simplebar-react' {
  import { ComponentType, HTMLAttributes } from 'react';
  
  interface SimpleBarProps extends HTMLAttributes<HTMLDivElement> {
    autoHide?: boolean;
    scrollableNodeProps?: Record<string, any>;
    scrollbarMaxSize?: number;
    scrollbarMinSize?: number;
    direction?: 'rtl' | 'ltr';
    forceVisible?: boolean | 'x' | 'y';
    clickOnTrack?: boolean;
    timeout?: number;
  }
  
  const SimpleBar: ComponentType<SimpleBarProps>;
  export default SimpleBar;
} 