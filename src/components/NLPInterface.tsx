import React, { useState } from 'react';
import { Mic, Send, MessageSquare, User, Bot, Volume2 } from 'lucide-react';
import { mockNLPCommands } from '../data/mockData';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: number;
}

const NLPInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your MedChain AI assistant. I can help you check stock levels, process reorders, report shortages, and verify drugs. How can I assist you today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processNLPCommand = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('check stock') || lowerInput.includes('inventory')) {
      const drugName = lowerInput.includes('paracetamol') ? 'paracetamol' : 
                       lowerInput.includes('aspirin') ? 'aspirin' : 
                       lowerInput.includes('amoxicillin') ? 'amoxicillin' : 'paracetamol';
      return {
        command: 'check_stock',
        response: `Current stock levels for ${drugName}: Central Hospital (1,250 units), Rural Clinic A (480 units), Regional Hospital (890 units). All locations have adequate supply.`,
        confidence: 0.92
      };
    }
    
    if (lowerInput.includes('reorder') || lowerInput.includes('order')) {
      const drugName = lowerInput.includes('aspirin') ? 'aspirin' : 
                       lowerInput.includes('amoxicillin') ? 'amoxicillin' : 'aspirin';
      return {
        command: 'reorder',
        response: `Reorder request submitted for ${drugName}. Recommended quantity: 500 units. Estimated delivery: 3-5 business days. Order ID: #MED-2024-${Math.floor(Math.random() * 1000)}`,
        confidence: 0.89
      };
    }
    
    if (lowerInput.includes('shortage') || lowerInput.includes('low stock')) {
      return {
        command: 'report_shortage',
        response: 'Shortage report has been logged and forwarded to the supply chain team. Priority level: High. Alternative suppliers have been notified. You will receive updates within 2 hours.',
        confidence: 0.95
      };
    }
    
    if (lowerInput.includes('verify') || lowerInput.includes('authentic')) {
      return {
        command: 'verify_drug',
        response: 'Drug verification initiated. Please provide the batch ID or scan the QR code. Blockchain verification will confirm authenticity, manufacturing details, and supply chain history.',
        confidence: 0.87
      };
    }
    
    return {
      command: 'general',
      response: 'I can help you with: checking stock levels, processing reorders, reporting shortages, and verifying drug authenticity. Please specify what you need assistance with.',
      confidence: 0.75
    };
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const response = processNLPCommand(inputText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        confidence: response.confidence
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  const simulateVoiceInput = () => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Speech recognition is not supported in your browser. Try using Chrome.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setIsListening(true);

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[0][0].transcript;
    setInputText(transcript);
    setIsListening(false);
    handleSendMessage(); // Auto-send message
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};


  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">NLP Voice Assistant</h2>
        
        {/* Chat Interface */}
        <div className="h-96 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {message.type === 'user' ? 'You' : 'AI Assistant'}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.confidence && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="text-xs opacity-75">
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </div>
                      <button
                        onClick={() => speakResponse(message.content)}
                        className="text-xs opacity-75 hover:opacity-100"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Input Area */}
        <div className="flex space-x-2">
          <button
            onClick={simulateVoiceInput}
            disabled={isListening}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isListening 
                ? 'bg-red-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Mic className="h-4 w-4" />
            {isListening ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-white rounded-full" />
                <span>Listening...</span>
              </div>
            ) : (
              <span>Voice</span>
            )}
          </button>
          
          <div className="flex-1 flex space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message or use voice input..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Commands */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Voice Commands</h3>
        <div className="space-y-3">
          {mockNLPCommands.map((command) => (
            <div key={command.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">"{command.input}"</p>
                  <span className="text-xs text-gray-500">
                    {new Date(command.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{command.response}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    Command: {command.command.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    Confidence: {(command.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NLPInterface;