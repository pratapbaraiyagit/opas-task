import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import Konva from 'konva';

import { useCanvasStore } from '../../../store/canvasStore';
import { CanvasShape } from '../../../types/canvas';

import { getSocket } from '../../../api/socket';
import { URLImage } from './components/URLImage';

export const BoardCanvas: React.FC = () => {
  const { 
    boardId,
    shapes, 
    addShape, 
    updateShape, 
    tool, 
    camera, 
    setCamera,
    selectedShapeIds,
    selectShapes,
    clearSelection
  } = useCanvasStore();

  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState<CanvasShape | null>(null);

  // Attach transformer to selected shapes
  useEffect(() => {
    if (!transformerRef.current || !layerRef.current) return;
    
    if (selectedShapeIds.length === 0) {
      transformerRef.current.nodes([]);
      return;
    }

    const nodes = selectedShapeIds
      .map(id => layerRef.current!.findOne(`#${id}`))
      .filter(Boolean) as Konva.Node[];
      
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedShapeIds, shapes]);

  // Handle Download Custom Event
  useEffect(() => {
    const handleDownload = () => {
      if (!stageRef.current) return;
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `board-${boardId}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    document.addEventListener('canvas:download', handleDownload);
    return () => document.removeEventListener('canvas:download', handleDownload);
  }, [boardId]);

  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return { x: 0, y: 0 };
    
    return {
      x: (pointerPosition.x - stage.x()) / stage.scaleX(),
      y: (pointerPosition.y - stage.y()) / stage.scaleY(),
    };
  };

  const handlePointerDown = (e: any) => {
    if (tool === 'hand') return;

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      clearSelection();
    }

    if (tool === 'select') return;

    const pos = getPointerPos();
    setIsDrawing(true);

    const newShape: CanvasShape = {
      id: uuidv4(),
      type: tool as any,
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      fill: tool === 'sticky' ? '#fef08a' : (tool === 'text' ? 'transparent' : '#e0e7ff'),
      stroke: tool === 'text' || tool === 'sticky' ? undefined : '#4f46e5',
      strokeWidth: tool === 'text' || tool === 'sticky' ? 0 : 2,
      points: tool === 'line' ? [pos.x, pos.y, pos.x, pos.y] : undefined,
      text: tool === 'text' ? 'New Text' : (tool === 'sticky' ? 'Note' : undefined),
    };

    setCurrentShape(newShape);
  };

  const lastEmitRef = useRef<number>(0);

  const handlePointerMove = () => {
    const pos = getPointerPos();

    // Broadcast cursor position (throttle to ~20fps to prevent flooding)
    const socket = getSocket();
    if (socket) {
      const now = Date.now();
      if (now - lastEmitRef.current > 50) {
        socket.emit('cursor:move', { boardId, cursor: pos });
        lastEmitRef.current = now;
      }
    }

    if (!isDrawing || !currentShape) return;

    if (currentShape.type === 'line') {
      setCurrentShape({
        ...currentShape,
        points: [currentShape.points![0], currentShape.points![1], pos.x, pos.y]
      });
    } else {
      setCurrentShape({
        ...currentShape,
        width: pos.x - currentShape.x,
        height: pos.y - currentShape.y,
      });
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentShape) return;
    
    setIsDrawing(false);
    
    // Normalize dimensions if negative
    const finalShape = { ...currentShape };
    if (finalShape.width && finalShape.width < 0) {
      finalShape.x += finalShape.width;
      finalShape.width = Math.abs(finalShape.width);
    }
    if (finalShape.height && finalShape.height < 0) {
      finalShape.y += finalShape.height;
      finalShape.height = Math.abs(finalShape.height);
    }

    // Only add if it has some size, or if it's text
    if (
      finalShape.type === 'text' || 
      (finalShape.width && finalShape.width > 5) || 
      (finalShape.points && Math.abs(finalShape.points[2] - finalShape.points[0]) > 5)
    ) {
      // Default size for text/sticky if just clicked
      if (finalShape.type === 'sticky' && (!finalShape.width || finalShape.width < 50)) {
        finalShape.width = 150;
        finalShape.height = 150;
      }
      addShape(finalShape);
    }
    
    setCurrentShape(null);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setCamera({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!stageRef.current) return;
    stageRef.current.setPointersPositions(e);

    const pos = getPointerPos();

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;

      // Load image natively to get natural dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate dimensions to fit nicely within a reasonable size
        const MAX_DIM = 400;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / w, MAX_DIM / h);
          w = w * ratio;
          h = h * ratio;
        }

        const newShape: CanvasShape = {
          id: uuidv4(),
          type: 'image',
          x: pos.x,
          y: pos.y,
          width: w,
          height: h,
          src: src,
        };
        addShape(newShape);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const renderShape = (shape: CanvasShape) => {
    const commonProps = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      rotation: shape.rotation,
      scaleX: shape.scaleX,
      scaleY: shape.scaleY,
      draggable: tool === 'select',
      onClick: () => {
        if (tool === 'select') selectShapes([shape.id]);
      },
      onDragEnd: (e: any) => {
        updateShape(shape.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      },
      onTransformEnd: (e: any) => {
        const node = e.target;
        updateShape(shape.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });
      }
    };

    switch (shape.type) {
      case 'rectangle':
        return <Rect key={shape.id} {...commonProps} />;
      case 'ellipse':
        return <Ellipse key={shape.id} {...commonProps} radiusX={Math.abs(shape.width!/2)} radiusY={Math.abs(shape.height!/2)} offset={{ x: -(shape.width!/2), y: -(shape.height!/2) }} />;
      case 'line':
        return <Line key={shape.id} {...commonProps} points={shape.points!} />;
      case 'sticky':
        return (
          <React.Fragment key={shape.id}>
            <Rect {...commonProps} shadowColor="black" shadowBlur={10} shadowOpacity={0.1} shadowOffset={{ x: 5, y: 5 }} />
            <Text 
              x={shape.x + 10} 
              y={shape.y + 10} 
              width={shape.width! - 20} 
              height={shape.height! - 20}
              text={shape.text} 
              fontSize={16}
              fill="#1f2937"
              fontFamily="Inter, sans-serif"
              listening={false}
            />
          </React.Fragment>
        );
      case 'text':
        return <Text key={shape.id} {...commonProps} text={shape.text} fontSize={24} fill="#1f2937" />;
      case 'image':
        return <URLImage key={shape.id} {...commonProps} src={shape.src!} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full h-full bg-surface-50 dark:bg-surface-950 overflow-hidden outline-none cursor-crosshair"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
        scaleX={camera.scale}
        scaleY={camera.scale}
        x={camera.x}
        y={camera.y}
        draggable={tool === 'hand'}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setCamera({ ...camera, x: e.target.x(), y: e.target.y() });
          }
        }}
        className={tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : (tool === 'select' ? 'cursor-default' : 'cursor-crosshair')}
      >
        <Layer ref={layerRef}>
          {shapes.map(renderShape)}
          {currentShape && renderShape(currentShape)}
          <Transformer 
            ref={transformerRef} 
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};
