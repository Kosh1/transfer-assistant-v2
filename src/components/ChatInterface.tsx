'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  Grid,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, SmartToy, Person, Mic } from '@mui/icons-material';
import { ChatMessage, TransferData, TransferOption } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { ChatSessionService } from '../services/chatSessionService';

interface ChatInterfaceProps {
  onDataReceived: (data: {
    from: string;
    to: string;
    passengers: number;
    luggage: number;
    date: string;
    time: string;
    transferOptions?: TransferOption[];
    transferAnalysis?: string;
    userLanguage?: string;
  }) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataReceived }) => {
  const { language } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your transfer assistant. Tell me about your transfer needs - where you\'re going, when, how many people, etc. I\'ll help you find the best options!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<Partial<TransferData>>({});
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [transferOptions, setTransferOptions] = useState<TransferOption[] | null>(null);
  const [transferAnalysis, setTransferAnalysis] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId] = useState('anonymous'); // В реальном приложении получать из auth
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  // Функция для загрузки истории чата
  const loadChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-history?sessionId=${sessionId}&userId=${userId}`);
      if (!response.ok) {
      throw new Error('Failed to load chat history');
      }
      
      const { messages: historyMessages } = await response.json();
      
      const formattedMessages: ChatMessage[] = historyMessages.map((msg: any) => ({
        id: msg.id,
        type: msg.sender_type,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history');
    }
  };

  // Clear conversation history
  const clearHistory = async () => {
    try {
      setMessages([
        {
          id: '1',
          type: 'assistant',
          content: 'Hello! I\'m your transfer assistant. Tell me about your transfer needs - where you\'re going, when, how many people, etc. I\'ll help you find the best options!',
          timestamp: new Date()
        }
      ]);
      setExtractedData({});
      setTransferData(null);
      setTransferOptions(null);
      setTransferAnalysis(null);
      setShowClearHistory(false);
      setSessionId(null); // Сброс сессии при очистке
      localStorage.removeItem('chatSessionId'); // Очистка localStorage
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear conversation history');
    }
  };

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not on every render
    if (messages.length > 0 && isInitialized) {
      scrollToBottom();
    }
  }, [messages.length, isInitialized]);

  // Set initialized flag after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Загрузка истории чата при наличии sessionId в URL или localStorage
  useEffect(() => {
    const loadSessionFromStorage = async () => {
      try {
        // Проверяем localStorage для sessionId
        const savedSessionId = localStorage.getItem('chatSessionId');
        if (savedSessionId && !sessionId) {
          setSessionId(savedSessionId);
          await loadChatHistory(savedSessionId);
        }
      } catch (error) {
        console.error('Failed to load session from storage:', error);
      }
    };

    loadSessionFromStorage();
  }, []);

  // Сохранение sessionId в localStorage
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatSessionId', sessionId);
    }
  }, [sessionId]);

  // Scroll to results when they appear
  useEffect(() => {
    if (transferData && transferOptions && transferAnalysis && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [transferData, transferOptions, transferAnalysis]);

  // LLM processing function
  const processWithLLM = async (userMessage: string, currentSessionId?: string) => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Process message through API with user language
      const response = await fetch('/api/process-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          userLanguage: language,
          sessionId: currentSessionId,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      // Сохраняем sessionId если он был создан
      if (result.sessionId && !sessionId) {
        setSessionId(result.sessionId);
      }
      
      // Check if we need clarification for addresses or passengers/luggage
      if (result.needsClarification) {
        // Add clarification message to chat
        await addAssistantMessage(result.response);
        setIsProcessing(false);
        return; // Stop processing, wait for user clarification
      }
      
      // Update extracted data if we have new information
      if (Object.keys(result.extractedData).length > 0) {
        console.log('📊 Extracted data:', result.extractedData);
        setExtractedData(prev => ({ ...prev, ...result.extractedData }));
        
        // Check if we have enough data to proceed
        const hasRoute = result.extractedData.from && result.extractedData.to;
        const hasTiming = result.extractedData.date || result.extractedData.time;
        const hasPassengers = result.extractedData.passengers !== undefined && result.extractedData.passengers !== null;
        const hasLuggage = result.extractedData.luggage !== undefined && result.extractedData.luggage !== null;
        
        console.log('🔍 Data validation:', {
          hasRoute,
          hasTiming,
          hasPassengers,
          hasLuggage,
          from: result.extractedData.from,
          to: result.extractedData.to,
          date: result.extractedData.date,
          time: result.extractedData.time,
          passengers: result.extractedData.passengers,
          luggage: result.extractedData.luggage
        });
        
        if (hasRoute && hasTiming && hasPassengers && hasLuggage) {
          console.log('✅ All data available, starting transfer search...');
          // We have enough data, search for transfers
          const transferResults = await searchAndAnalyzeTransfers({
            ...extractedData,
            ...result.extractedData
          });
          
          if (transferResults.success && transferResults.data) {
            // Send transfer data to parent component
            onDataReceived({ 
              ...extractedData, 
              ...result.extractedData,
              transferOptions: transferResults.data,
              transferAnalysis: transferResults.message,
              userLanguage: language
            });
            
            // Don't return message to chat - results will be shown in TransferResults component
            return null;
          } else if (transferResults.success) {
            // Success but no data - show "nothing found" message
            const noDataMessage = "К сожалению, я ничего не нашла для вашего маршрута. Попробуйте изменить параметры поиска.";
            onDataReceived({ 
              ...extractedData, 
              ...result.extractedData,
              transferOptions: null,
              transferAnalysis: noDataMessage,
              userLanguage: language
            });
            
            // Return the "nothing found" message to chat
            return noDataMessage;
          }
        } else {
          console.log('⚠️ Not enough data for transfer search, waiting for more information...');
        }
      } else {
        console.log('📝 No extracted data from LLM response');
      }
      
      return result.response;
      
    } catch (err) {
      throw new Error('Failed to process your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const searchAndAnalyzeTransfers = async (transferData: Partial<TransferData>) => {
    try {
      console.log('🚀 Starting transfer search with data:', transferData);
      
      const response = await fetch('/api/analyze-transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          transferData: transferData,
          userLanguage: language
        })
      });

      console.log('📡 API response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Transfer search result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error analyzing transfers:', error);
      return {
        success: false,
        message: `Ошибка анализа трансферов: ${error}`,
        data: null
      };
    }
  };

  const addUserMessage = async (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAssistantMessage = async (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    
    try {
      // Save user message to chat
      await addUserMessage(userMessage);
      
      // Process with LLM (теперь с sessionId)
      const llmResponse = await processWithLLM(userMessage, sessionId || undefined);
      
      // Only add assistant response to chat if there's a message to show
      if (llmResponse) {
        await addAssistantMessage(llmResponse);
      }
      
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startRecording = async () => {
    try {
      setError('');
      setAudioChunks([]);
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser. Please use Chrome, Firefox, or Safari.');
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Show voice interface
      setShowVoiceInterface(true);
      
      // Create MediaRecorder with fallback mime types
      let recorder: MediaRecorder;
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          recorder = new MediaRecorder(stream, { mimeType });
          break;
        }
      }
      
      if (!recorder!) {
        recorder = new MediaRecorder(stream);
      }
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe audio using API
        setIsListening(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'audio.webm');

          const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }

          const result = await response.json();
          const transcript = result.transcription;
          setInputText(transcript);
          setShowVoiceInterface(false);
          
          // Auto-send the transcribed message
          if (transcript.trim()) {
            await handleSendMessage();
          }
        } catch (err) {
          setError('Failed to transcribe audio: ' + (err instanceof Error ? err.message : 'Unknown error'));
          setShowVoiceInterface(false);
          setIsTranscribing(false);
        } finally {
          setIsListening(false);
          setIsTranscribing(false);
        }
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setShowVoiceInterface(false);
      setIsTranscribing(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={3}>
        {/* Chat Interface */}
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: 500,
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 1,
            }}
          >
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <List sx={{ p: 0 }}>
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <ListItem sx={{ 
                        flexDirection: 'column', 
                        alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                        p: 0, mb: 2
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 1,
                          maxWidth: '80%',
                          flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                        }}>
                          <Avatar sx={{ 
                            bgcolor: message.type === 'user' ? 'white' : 'rgba(255,255,255,0.2)',
                            color: message.type === 'user' ? 'primary.main' : 'white',
                            width: 32,
                            height: 32
                          }}>
                            {message.type === 'user' ? <Person /> : <SmartToy />}
                          </Avatar>
                          <Paper sx={{ 
                            p: 2, 
                            bgcolor: message.type === 'user' ? 'white' : 'rgba(255,255,255,0.1)',
                            color: message.type === 'user' ? 'text.primary' : 'white',
                            borderRadius: 1,
                            maxWidth: '100%'
                          }}>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                              {message.content}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                              {message.timestamp.toLocaleTimeString()}
                            </Typography>
                          </Paper>
                        </Box>
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', p: 0, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                          <SmartToy />
                        </Avatar>
                        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} sx={{ color: 'white' }} />
                            <Typography variant="body2">Processing your request...</Typography>
                          </Box>
                        </Paper>
                      </Box>
                    </ListItem>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </List>
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <AnimatePresence mode="wait">
                {showVoiceInterface ? (
                  <motion.div
                    key="voice-interface"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={stopRecording}
                        sx={{
                          bgcolor: 'error.main',
                          color: 'white',
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          '&:hover': {
                            bgcolor: 'error.main',
                          },
                        }}
                      >
                        Stop Recording
                      </Button>
                    </Box>
                  </motion.div>
                ) : isTranscribing ? (
                  <motion.div
                    key="transcribing-interface"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <CircularProgress sx={{ color: 'white', mb: 1 }} />
                      <Typography variant="body2">Transcribing audio...</Typography>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text-interface"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tell me about your transfer needs..."
                        disabled={isProcessing}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255,255,255,0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'white',
                            },
                            '& input::placeholder': {
                              color: 'rgba(255,255,255,0.7)',
                              opacity: 1,
                            },
                            '& textarea::placeholder': {
                              color: 'rgba(255,255,255,0.7)',
                              opacity: 1,
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isProcessing}
                        sx={{
                          bgcolor: 'white',
                          color: 'primary.main',
                          minWidth: 48,
                          height: 56,
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                          },
                          '&:disabled': {
                            bgcolor: 'rgba(255,255,255,0.3)',
                            color: 'rgba(255,255,255,0.5)',
                          },
                        }}
                      >
                        <Send />
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={startRecording}
                        disabled={isProcessing || isListening}
                        sx={{
                          color: 'white',
                          borderColor: 'white',
                          minWidth: 48,
                          height: 56,
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                          },
                        }}
                      >
                        <Mic />
                      </Button>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isListening && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Transcribing audio...
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ChatInterface;
