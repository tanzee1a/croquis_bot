import React, { useState } from 'react';
// Import 'Box' for the background container
import {
  Box,
  Container,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Button,
  useToast
} from '@chakra-ui/react';

function App() {
  const [images, setImages] = useState([]);
  const [timer, setTimer] = useState(30);
  const [count, setCount] = useState(5);
  const [uploaded, setUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading states
  const toast = useToast(); // Hook for showing notifications

  const handleImageChange = (e) => {
  const files = e.target.files;
  setImages([...files]); // Update the images state
  setCount(files.length); // NEW: Update the count state
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    formData.append('timer', timer);
    formData.append('count', count);

    try {
      const response = await fetch('https://croquis-bot.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
      toast({
        title: 'Upload Successful!',
        description: "Your images are ready for the session.",
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
    // This Box is the new background container
    <Box
      bgImage="url(/background1.jpg)" // Path to your image in the /public folder
      bgSize="cover"
      bgPosition="center"
      minH="100vh" // Ensure it covers the full viewport height
    >
      <Container centerContent p={8}>
        {/* This VStack is now the translucent white box */}
        <VStack
          bg="rgba(255, 255, 255, 0.8)" // White background with 80% opacity
          p={8}
          borderRadius="lg" // Adds rounded corners
          boxShadow="xl" // Adds a subtle shadow
          spacing={6}
          as="form"
          onSubmit={handleUpload}
          width="100%"
          maxWidth="480px"
        >
          <Heading>🎨 Croquis Session Dashboard</Heading>

          {/* All your form controls go here as before */}
          <FormControl isRequired>
            <FormLabel>Upload Images:</FormLabel>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              p={1.5}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Timer per Image (seconds):</FormLabel>
            <NumberInput value={timer} onChange={(val) => setTimer(val)}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Number of Images:</FormLabel>
            <NumberInput value={count} onChange={(val) => setCount(val)}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <Button
            type="submit"
            colorScheme="pink"
            size="lg"
            width="100%"
            isLoading={isLoading}
          >
            Upload Images
          </Button>
          <Button
            onClick={handleStartSession}
            colorScheme="teal"
            size="lg"
            width="100%"
            disabled={!uploaded}
            isLoading={isLoading}
          >
            Start Session in Discord
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;