import React, { useState } from 'react';
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
  // The 'count' state has been removed
  const [uploaded, setUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
    // The 'setCount' line has been removed
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    // The validation check for 'count' has been removed
    setIsLoading(true);
    const formData = new FormData();
    images.forEach((img) => formData.append('images', img));
    formData.append('timer', timer);
    // The line that appends 'count' has been removed

    try {
      // ... (rest of the try/catch block is the same)
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
  
  // The handleStartSession function remains the same

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
    <Box
      bgImage="url(/background.jpg)"
      bgSize="cover"
      bgPosition="center"
      minH="100vh"
    >
      <Container centerContent p={8}>
        <VStack
          bg="rgba(255, 255, 255, 0.8)"
          p={8}
          borderRadius="lg"
          boxShadow="xl"
          spacing={6}
          as="form"
          onSubmit={handleUpload}
          width="100%"
          maxWidth="480px"
        >
          <Heading>🎨 Croquis Session Dashboard</Heading>
          
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
          
          {/* The entire FormControl for "Number of Images" has been removed */}

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
            disabled={!uploaded || isLoading}
          >
            Start Session in Discord
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

export default App;