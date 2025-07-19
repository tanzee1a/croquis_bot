import React, { useState } from 'react';
import {
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  useToast,
  HStack,
  Image,
  Text,
  IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';


function App() {
  const [images, setImages] = useState([]);
  const [timer, setTimer] = useState(30);
  const [uploaded, setUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...newFiles]);
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleClearImages = () => {
    setImages([]);
    setUploaded(false);
  };

  // CHANGE #1: The function no longer needs the 'e' event object
  const handleUpload = async () => {
    // e.preventDefault() is no longer needed

    if (images.length === 0) {
      toast({
        title: 'No images selected!',
        description: `Please select one or more images to upload.`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    formData.append('timer', timer);

    try {
      const response = await fetch('https://croquis-bot.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      toast({
        title: 'Upload Successful!',
        description: `Ready to start a session with ${images.length} images.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setUploaded(true);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Upload Failed.',
        description: "There was an error uploading your images.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleStartSession = async () => {
    if (!uploaded) {
      toast({
        title: 'Please upload images first!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('https://croquis-bot.onrender.com/start-session', {
        method: 'POST',
      });
      const result = await response.json();
      console.log(result);
      toast({
        title: 'Session Started!',
        description: 'Check your Discord channel. 🎉',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Failed to Start Session.',
        description: "There was an error starting the session.",
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Container centerContent p={8}>
      {/* CHANGE #2: The VStack is no longer a form and has no onSubmit */}
      <VStack
        bg="rgba(255, 255, 255, 0.85)"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
        spacing={6}
        width="100%"
        maxWidth="480px"
      >
        <Heading>🎨 Croquis Session Dashboard</Heading>
        
        <FormControl isRequired>
          <FormLabel>Add Images:</FormLabel>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            p={1.5}
          />
        </FormControl>

        {images.length > 0 && (
          <VStack spacing={2} align="stretch" width="100%" border="1px" borderColor="gray.200" borderRadius="md" p={3}>
            <HStack justify="space-between">
              <Text fontWeight="bold">{images.length} image(s) selected:</Text>
              <Button size="sm" onClick={handleClearImages}>Clear All</Button>
            </HStack>
            {images.map((file, index) => (
              <HStack key={index} justify="space-between" width="100%">
                <HStack>
                  <Image
                    boxSize="40px"
                    objectFit="cover"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                  />
                  <Text fontSize="sm" isTruncated maxWidth="250px">{file.name}</Text>
                </HStack>
                <IconButton
                  aria-label="Remove image"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={() => handleRemoveImage(index)}
                />
              </HStack>
            ))}
          </VStack>
        )}

        <FormControl>
          <FormLabel>Timer per Image (seconds):</FormLabel>
          <NumberInput value={timer} onChange={(val) => setTimer(val)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        
        {/* CHANGE #3: The button is no longer type="submit" and has its own onClick */}
        <Button
          onClick={handleUpload}
          bg="brand.primary"
          color="gray.800"
          size="lg"
          width="100%"
          isLoading={isLoading}
          _hover={{ bg: 'brand.secondary' }}
        >
          Upload Images
        </Button>
        <Button
          onClick={handleStartSession}
          bg="brand.secondary"
          color="gray.800"
          size="lg"
          width="100%"
          disabled={!uploaded || isLoading}
          _hover={{ bg: 'brand.primary' }}
        >
          Start Session in Discord
        </Button>
      </VStack>
    </Container>
  );
}

export default App;