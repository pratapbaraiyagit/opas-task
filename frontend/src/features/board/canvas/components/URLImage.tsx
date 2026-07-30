import React from 'react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface URLImageProps {
  id: string;
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  draggable?: boolean;
  onClick?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onTransformEnd?: (e: any) => void;
}

export const URLImage: React.FC<URLImageProps> = (props) => {
  const [image] = useImage(props.src, 'anonymous');

  return (
    <KonvaImage
      {...props}
      image={image}
    />
  );
};
