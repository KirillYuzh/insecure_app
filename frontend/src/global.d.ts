// For CSS/SCSS files
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
  }
  
  // For images
  declare module '*.png';
  declare module '*.jpg';
  declare module '*.jpeg';
  declare module '*.svg' {
    import React from 'react';
    const content: React.FC<React.SVGProps<SVGSVGElement>>;
    export default content;
  }