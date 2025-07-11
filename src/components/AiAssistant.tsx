import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Globe, Loader, CheckCircle, AlertCircle, Mic, MicOff } from 'lucide-react';
import aiService from '../services/ai';
import apiService from '../services/api';
import blockchainService from '../services/blockchain';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  confidence?: number;
  language?: string;
  loading?: boolean;
}

interface InventoryContext {
  totalDrugs: number;
  lowStockCount: number;
  expiringCount: number;
  locations: string[];
  recentActivity: string[];
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your intelligent MedChain AI assistant. I can help you with inventory management, drug verification, expiry tracking, and much more. Try asking me: "List expired medicines" or "What\'s our stock summary?"',
      isUser: false,
      timestamp: new Date(),
      confidence: 1.0
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [inventoryContext, setInventoryContext] = useState<InventoryContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  useEffect(() => {
    scrollToBottom();
    loadInventoryContext();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadInventoryContext = async () => {
    try {
      const summary = await apiService.getInventorySummary();
      const lowStock = await apiService.getLowStock();
      const expired = await apiService.getExpiredDrugs();
      
      setInventoryContext({
        totalDrugs: summary.totalDrugs || 0,
        lowStockCount: lowStock.count || 0,
        expiringCount: expired.count || 0,
        locations: summary.locations?.map(l => l.name) || [],
        recentActivity: ['Recent inventory updates', 'New stock arrivals', 'Expiry alerts processed']
      });
    } catch (error) {
      console.error('Failed to load inventory context:', error);
    }
  };

  const processAdvancedNLPCommand = async (input: string, language: string) => {
    const lowerInput = input.toLowerCase();
    
    try {
      // Drug Expiry Detection
      if (lowerInput.includes('expired') || lowerInput.includes('expire') || lowerInput.includes('expiry')) {
        const daysMatch = lowerInput.match(/(\d+)\s*days?/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 0;
        
        const expiredData = await apiService.getExpiredDrugs(days);
        const contextPrompt = `
          User asked about expired medicines in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Expired/Expiring drugs data: ${JSON.stringify(expiredData)}
          Current inventory context: ${JSON.stringify(inventoryContext)}
          
          Provide a comprehensive response about expired medicines with:
          - List of expired/expiring drugs with locations
          - Immediate actions needed
          - Safety recommendations
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Stock Forecasting
      if (lowerInput.includes('forecast') || lowerInput.includes('predict') || lowerInput.includes('order next') || lowerInput.includes('demand')) {
        const drugName = extractDrugName(lowerInput);
        const timeframe = lowerInput.includes('month') ? 'month' : lowerInput.includes('week') ? 'week' : '30 days';
        
        const forecastData = await apiService.getDemandPrediction(null, drugName);
        const contextPrompt = `
          User asked about stock forecasting in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Forecast data: ${JSON.stringify(forecastData)}
          Drug: ${drugName}
          Timeframe: ${timeframe}
          Current inventory: ${JSON.stringify(inventoryContext)}
          
          Provide detailed forecasting insights with:
          - Predicted demand numbers
          - Recommended order quantities
          - Seasonal considerations
          - Cost optimization tips
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Low Stock Alerts
      if (lowerInput.includes('low stock') || lowerInput.includes('shortage') || lowerInput.includes('running low')) {
        const threshold = lowerInput.match(/(\d+)/)?.[0] || '50';
        const lowStockData = await apiService.getLowStock(parseInt(threshold));
        
        const contextPrompt = `
          User asked about low stock in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Low stock data: ${JSON.stringify(lowStockData)}
          Threshold: ${threshold}
          Locations: ${inventoryContext?.locations.join(', ')}
          
          Provide comprehensive low stock analysis with:
          - Location-wise breakdown
          - Critical vs moderate alerts
          - Immediate reorder recommendations
          - Supply chain suggestions
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Smart Drug Summary
      if (lowerInput.includes('tell me about') || lowerInput.includes('information about') || lowerInput.includes('details about')) {
        const drugName = extractDrugName(lowerInput);
        const inventoryData = await apiService.getAllInventory();
        
        const contextPrompt = `
          User asked about drug information in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Drug: ${drugName}
          Current inventory: ${JSON.stringify(inventoryData)}
          
          Provide comprehensive drug information including:
          - Current stock levels across locations
          - Clinical information and usage
          - Storage requirements
          - Expiry status
          - Manufacturer details
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Proactive Inventory Reports
      if (lowerInput.includes('summary') || lowerInput.includes('report') || lowerInput.includes('update') || lowerInput.includes('overview')) {
        const summaryData = await apiService.getInventorySummary();
        const timeframe = lowerInput.includes('week') ? 'weekly' : lowerInput.includes('daily') ? 'daily' : 'current';
        
        const contextPrompt = `
          User requested inventory report in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Summary data: ${JSON.stringify(summaryData)}
          Timeframe: ${timeframe}
          Context: ${JSON.stringify(inventoryContext)}
          
          Provide comprehensive inventory report with:
          - Overall stock status
          - Location-wise breakdown
          - Critical alerts and actions needed
          - Performance metrics
          - Recommendations for optimization
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Reorder Trigger via AI
      if (lowerInput.includes('reorder') && (lowerInput.includes('if') || lowerInput.includes('<') || lowerInput.includes('below'))) {
        const drugName = extractDrugName(lowerInput);
        const threshold = lowerInput.match(/(\d+)/)?.[0] || '100';
        
        const reorderResult = await apiService.triggerReorder(drugName, parseInt(threshold));
        
        const contextPrompt = `
          User requested conditional reorder in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
          Query: "${input}"
          
          Drug: ${drugName}
          Threshold: ${threshold}
          Reorder result: ${JSON.stringify(reorderResult)}
          
          Provide reorder status with:
          - Whether reorder was triggered
          - Current stock levels
          - Order details if placed
          - Expected delivery timeline
          - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
        `;
        
        return await aiService.askGemini(contextPrompt);
      }

      // Batch Verification via NLP
      if (lowerInput.includes('verify batch') || lowerInput.includes('check batch') || lowerInput.includes('authenticate')) {
        const batchId = lowerInput.match(/[A-Z]{2}-\d{4}-\d{3}/)?.[0] || extractBatchId(lowerInput);
        
        if (!batchId) {
          return `Please provide a valid batch ID (e.g., PC-2024-001) for verification.`;
        }

        try {
          const blockchainResult = await blockchainService.getDrug(batchId);
          const backendResult = await apiService.verifyBatch(batchId);
          
          const contextPrompt = `
            User requested batch verification in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
            Query: "${input}"
            
            Batch ID: ${batchId}
            Blockchain result: ${JSON.stringify(blockchainResult)}
            Backend result: ${JSON.stringify(backendResult)}
            
            Provide comprehensive verification result with:
            - Authenticity status
            - Drug details and manufacturer
            - Blockchain confirmation
            - Safety recommendations
            - Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}
          `;
          
          return await aiService.askGemini(contextPrompt);
        } catch (error) {
          return `Batch verification failed. Please check the batch ID and try again.`;
        }
      }

      // General AI Query with Context
      const contextPrompt = `
        User query in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}: "${input}"
        
        Current inventory context: ${JSON.stringify(inventoryContext)}
        Available features: drug verification, inventory management, expiry tracking, demand forecasting
        
        You are an intelligent medical supply chain AI assistant. Provide helpful, accurate information.
        If the query is in Hindi or Bengali, respond in the same language.
        If you need specific data, suggest what commands the user can try.
      `;
      
      return await aiService.askGemini(contextPrompt);

    } catch (error) {
      console.error('Advanced NLP processing error:', error);
      return `I encountered an error processing your request. Please try again or contact support.`;
    }
  };

  const extractDrugName = (input: string): string => {
    const drugNames = ['paracetamol', 'amoxicillin', 'aspirin', 'metformin', 'ibuprofen', 'ciprofloxacin'];
    const found = drugNames.find(drug => input.toLowerCase().includes(drug));
    return found || input.split(' ').find(word => word.length > 4) || 'medicine';
  };

  const extractBatchId = (input: string): string => {
    const words = input.split(' ');
    return words.find(word => word.includes('-') && word.length > 5) || '';
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing your request...',
      isUser: false,
      timestamp: new Date(),
      loading: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    setInputText('');

    try {
      const response = await processAdvancedNLPCommand(inputText, selectedLanguage);
      
      // Remove loading message and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          text: response,
          isUser: false,
          timestamp: new Date(),
          confidence: 0.95,
          language: selectedLanguage
        }];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.loading);
        return [...filtered, {
          id: (Date.now() + 2).toString(),
          text: 'I apologize, but I encountered an error processing your request. Please try again.',
          isUser: false,
          timestamp: new Date(),
          confidence: 0.5
        }];
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const quickCommands = [
    { text: 'List expired medicines', icon: '⏰' },
    { text: 'Show low stock alerts', icon: '📉' },
    { text: 'Weekly inventory summary', icon: '📊' },
    { text: 'Tell me about Paracetamol', icon: '💊' },
    { text: 'Verify batch PC-2024-001', icon: '🔍' },
    { text: 'Forecast demand for next month', icon: '📈' }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
      >
        <MessageCircle className="w-6 h-6" />
        {inventoryContext && inventoryContext.lowStockCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {inventoryContext.lowStockCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold">AI Medical Assistant</h3>
                <p className="text-xs opacity-90">Intelligent Supply Chain Helper</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white/20 text-white text-xs rounded px-2 py-1 border-0 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-800">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Quick Commands */}
          <div className="p-3 bg-gray-50 border-b">
            <p className="text-xs text-gray-600 mb-2">Quick Commands:</p>
            <div className="flex flex-wrap gap-1">
              {quickCommands.slice(0, 3).map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(cmd.text)}
                  className="text-xs bg-white hover:bg-blue-50 text-gray-700 px-2 py-1 rounded-full border border-gray-200 transition-colors"
                >
                  {cmd.icon} {cmd.text.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {message.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {message.confidence && (
                      <div className="flex items-center gap-1">
                        {message.confidence > 0.9 ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                        )}
                        <span>{Math.round(message.confidence * 100)}%</span>
                      </div>
                    )}
                    {message.language && message.language !== 'en' && (
                      <Globe className="w-3 h-3" />
                    )}
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  message.isUser 
                    ? 'bg-blue-100 text-blue-600 order-1 mr-2' 
                    : 'bg-purple-100 text-purple-600 order-2 ml-2'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <button
                onClick={startVoiceRecognition}
                disabled={isListening}
                className={`p-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedLanguage === 'hi' ? 'अपना सवाल पूछें...' :
                  selectedLanguage === 'bn' ? 'আপনার প্রশ্ন জিজ্ঞাসা করুন...' :
                  'Ask me anything about your medical inventory...'
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {inventoryContext && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-4">
                <span>📦 {inventoryContext.totalDrugs} drugs</span>
                <span>⚠️ {inventoryContext.lowStockCount} low stock</span>
                <span>⏰ {inventoryContext.expiringCount} expiring</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}