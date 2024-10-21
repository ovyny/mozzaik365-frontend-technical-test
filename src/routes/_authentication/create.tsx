import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MemeEditor } from "../../components/meme-editor";
import { useMemo, useState } from "react";
import { MemePictureProps } from "../../components/meme-picture";
import { Plus, Trash } from "@phosphor-icons/react";
import { useAuthToken } from "../../contexts/authentication";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeme, GetMemesWithDetailsResponse } from "../../api";

export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

type Picture = {
  url: string;
  file: File;
};

function CreateMemePage() {
  const [picture, setPicture] = useState<Picture | null>(null);
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  const [description, setDescription] = useState("");

  const token = useAuthToken();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: `New caption ${texts.length + 1}`,
        x: Math.random() * 400,
        y: Math.random() * 225,
      },
    ]);
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const memePicture = useMemo(() => {
    if (!picture) {
      return undefined;
    }

    return {
      pictureUrl: picture.url,
      texts,
    };
  }, [picture, texts]);

  const createMemeMutation = useMutation({
    mutationFn: async () => {
      if (!picture) {
        throw new Error("Please upload a picture.");
      }

      const formData = new FormData();
      formData.append("Picture", picture.file);
      formData.append("Description", description);

      texts.forEach((text, index) => {
        formData.append(`Texts[${index}][Content]`, text.content);
        formData.append(`Texts[${index}][X]`, Math.round(text.x).toString());
        formData.append(`Texts[${index}][Y]`, Math.round(text.y).toString());
      });

      const createdMeme = await createMeme(token, formData);
      return createdMeme;
    },
    onSuccess: (createdMeme) => {
      queryClient.setQueryData(
        ["memes"],
        (oldData: GetMemesWithDetailsResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              results: [createdMeme, ...oldData.results],
            };
          }
          return oldData;
        }
      );
      navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Error creating meme:", error);
      alert("An error occurred while creating the meme.");
    },
  });

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            {texts.map((text, index) => (
              <Flex width="full" key={index}>
                <Input
                  value={text.content}
                  mr={1}
                  onChange={(e) => {
                    const updatedTexts = [...texts];
                    updatedTexts[index] = {
                      ...updatedTexts[index],
                      content: e.target.value,
                    };
                    setTexts(updatedTexts);
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={memePicture === undefined}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            isDisabled={
              !picture ||
              description.trim() === "" ||
              texts.length === 0 ||
              createMemeMutation.isPending
            }
            onClick={() => createMemeMutation.mutate()}
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
