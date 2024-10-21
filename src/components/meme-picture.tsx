import { Box, Text, useDimensions } from "@chakra-ui/react";
import { useMemo, useRef } from "react";
import Draggable from "react-draggable";

export type MemePictureProps = {
  pictureUrl: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  dataTestId?: string;
  onCaptionMove?: (index: number, x: number, y: number) => void;
  editable?: boolean;
};

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

export const MemePicture: React.FC<MemePictureProps> = ({
  pictureUrl,
  texts: rawTexts,
  dataTestId = "",
  onCaptionMove,
  editable = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(containerRef, true);
  const boxWidth = dimensions?.borderBox.width;

  const { height, fontSize, texts } = useMemo(() => {
    if (!boxWidth) {
      return { height: 0, fontSize: 0, texts: rawTexts };
    }

    return {
      height: (boxWidth / REF_WIDTH) * REF_HEIGHT,
      fontSize: (boxWidth / REF_WIDTH) * REF_FONT_SIZE,
      texts: rawTexts.map((text) => ({
        ...text,
        x: (boxWidth / REF_WIDTH) * text.x,
        y: (boxWidth / REF_WIDTH) * text.y,
      })),
    };
  }, [boxWidth, rawTexts]);

  const handleDrag = (
    index: number,
    e: any,
    data: { x: number; y: number }
  ) => {
    if (onCaptionMove) {
      const scaleFactor = REF_WIDTH / (boxWidth || 1);
      onCaptionMove(index, data.x * scaleFactor, data.y * scaleFactor);
    }
  };

  return (
    <Box
      width="full"
      height={height}
      ref={containerRef}
      backgroundImage={pictureUrl}
      backgroundColor="gray.100"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      overflow="hidden"
      position="relative"
      borderRadius={8}
      data-testid={dataTestId}
    >
      {texts.map((text, index) => (
        <Draggable
          key={index}
          position={{ x: text.x, y: text.y }}
          onStop={(e, data) => handleDrag(index, e, data)}
          disabled={!editable}
        >
          <Text
            position="absolute"
            fontSize={fontSize}
            color="white"
            fontFamily="Impact"
            fontWeight="bold"
            userSelect="none"
            textTransform="uppercase"
            style={{
              WebkitTextStroke: "1px black",
              cursor: editable ? "move" : "default",
            }}
            data-testid={`${dataTestId}-text-${index}`}
          >
            {text.content}
          </Text>
        </Draggable>
      ))}
    </Box>
  );
};
