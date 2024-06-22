'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Input, Button, useColorModeValue, Text } from '@chakra-ui/react';
import CustomAvatar from '@core/components/mui/Avatar';

export default function Chat() {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue('gray.500', 'whiteAlpha.600');

  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    setChatMessages([
      { text: 'Welcome to the chat!', isUser: false },
      { text: 'Search for Your Favorite Stocks Like APPLE, NVIDIA, TESLA ...', isUser: true },
    ]);
  }, []);

  const handleChange = (event) => {
    setInputCode(event.target.value);
  };

  const addMessageToChat = (text, isUser = false) => {
    const newMessage = { text, isUser };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSearch = async () => {
    if (!inputCode) {
      alert('Please enter a search query.');

      return;
    }

    addMessageToChat(inputCode, true);
    setInputCode('');
    setLoading(true);

    try {
      console.log('Sending request to API:', inputCode);
      const response = await fetch('https://api.wallie.ai/wallie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: inputCode }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received response from API:', data);

      const message = data.response || 'No response from Wallie AI. Please try again later.';
      addMessageToChat(message, false);
    } catch (error) {
      console.error('Error fetching data:', error);
      addMessageToChat('An error occurred while fetching data. Please try again later.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex
      w="100%"
      h="725px"
      direction="column"
      position="relative"
      px={{ base: 4, md: 0 }}
      justifyContent="center"
    >
      <Box
        flex="1"
        p={{ base: 4, md: 8 }}
        borderRadius="25px"
        overflowY="auto"
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        h="70vh"
      >
        {chatMessages.map((message, index) => (
          <ChatBubble key={index} text={message.text} isUser={message.isUser} />
        ))}
      </Box>

      <Flex
        w="100%"
        justifyContent="center"
      >
        <Flex
          direction="row"
          alignItems="center"
          w="70%"
          mt="auto"
          p={{ base: 4, md: 0 }}
          h="20vh"
        >
          <Input
            minH="54px"
            border="2px solid"
            borderColor={borderColor}
            borderRadius="25px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            fontFamily="Poppins"
            _focus={{ borderColor: 'blue.400', boxShadow: 'none' }}
            color={inputColor}
            _placeholder={{ color: placeholderColor }}
            placeholder="Ask Wallie AI how the US Market is going to perform..."
            value={inputCode}
            onChange={handleChange}
            flex="1"
            onKeyDown={handleKeyDown}
            transition="border-color 0.3s"
          />

          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            bg="linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)"
            _hover={{
              boxShadow: '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #3523A0 26.3%, #5C3FCC 86.4%) !important',
              _disabled: { bg: 'linear-gradient(15.46deg, #3523A0 26.3%, #5C3FCC 86.4%)' },
              color: 'white',
              transform: 'scale(1.05)',
            }}
            isLoading={loading}
            color="white"
            transition="0.3s"
            onClick={handleSearch}
          >
            Submit
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

const ChatBubble = ({ text, isUser }) => {
  return (
    <Box
      p="10px"
      bg={isUser ? 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)' : 'gray.200'}
      color={isUser ? 'white' : 'navy.700'}
      borderRadius="8px"
      boxShadow={isUser ? '4px 8px 12px rgba(0, 0, 0, 0.1)' : '2px 4px 6px rgba(0, 0, 0, 0.1)'}
      maxWidth="70%"
      margin="8px 10px 10px 10px"
      alignSelf={isUser ? 'flex-end' : 'flex-start'}
      opacity="1"
      transform="translateY(10px)"
      transition="opacity 0.3s, transform 0.3s"
      display="flex"
      alignItems="center"
      whiteSpace="pre-wrap" // Ensures the text preserves line breaks and spaces
      _hover={{
        transform: 'translateY(5px)',
      }}
    >
      {!isUser && <CustomAvatar alt='user-profile' src='/images/img/wallie.png' variant='rounded' size={40} />}
      <Text ml={isUser ? 0 : 2}>{text}</Text>
    </Box>
  );
};
