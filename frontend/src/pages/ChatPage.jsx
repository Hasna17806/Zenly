import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  // Load chat history when page loads
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    loadChatHistory();
  }, [navigate]);

  const loadChatHistory = async () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    const response = await axios.get("http://localhost:5000/api/chatbot/history", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.length > 0) {
      setMessages(response.data);
    } else {
      // Show welcome messages if no history
      setMessages([
        {
          _id: 'welcome1',
          message: "Hi 👋 How are you feeling today?",
          sender: "bot",
          createdAt: new Date().toISOString()
        },
        {
          _id: 'welcome2',
          message: "I am here to listen.",
          sender: "bot",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  } catch (error) {
    console.error("Error loading chat history:", error);
    // Still show welcome messages on error
    setMessages([
      {
        _id: 'welcome1',
        message: "Hi 👋 How are you feeling today?",
        sender: "bot",
        createdAt: new Date().toISOString()
      },
      {
        _id: 'welcome2',
        message: "I am here to listen.",
        sender: "bot",
        createdAt: new Date().toISOString()
      }
    ]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    // Create temporary user message for UI
    const tempUserMessage = {
      _id: 'temp-' + Date.now(),
      message: inputMessage,
      sender: "user",
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send to backend - make sure the endpoint is correct
      const response = await axios.post(
        "http://localhost:5000/api/chatbot/send", 
        { message: inputMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Chat response:", response.data); // Debug log

      // Remove temp message and add both user and bot messages from response
      setMessages(prev => {
        // Filter out temp message
        const withoutTemp = prev.filter(msg => !msg._id.toString().startsWith('temp-'));
        
        // Add both messages from response
        const newMessages = [...withoutTemp];
        
        if (response.data.userMsg) {
          newMessages.push(response.data.userMsg);
        }
        if (response.data.botMsg) {
          newMessages.push(response.data.botMsg);
        }
        
        return newMessages;
      });

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Show error message
      const errorMessage = {
        _id: 'error-' + Date.now(),
        message: "Sorry, I'm having trouble connecting. Please try again.",
        sender: "bot",
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('stress') || msg.includes('stressed')) {
      return "I'm sorry you're feeling stressed. Want to try a breathing challenge? 🧘";
    }
    if (msg.includes('sad') || msg.includes('depress')) {
      return "That sounds tough. Remember, it's okay to feel sad sometimes 💙";
    }
    if (msg.includes('happy') || msg.includes('good')) {
      return "I'm so happy to hear that! 😊 What's making you feel good today?";
    }
    return "Tell me more. I'm here to listen 😊";
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      'stressed': "I am feeling a bit stressed today 😭 Can we talk for a moment?",
      'sad': "I'm feeling a bit down today 💙",
      'anxious': "I'm feeling anxious about my studies 📚",
      'happy': "I'm feeling great today! 😊",
      'tired': "I'm feeling exhausted 😴",
      'help': "I need some help 😔"
    };
    
    setInputMessage(quickMessages[action] || quickMessages.stressed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
        <Navbar />
        <main className="flex-grow py-20 px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading chat...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex flex-col">
      <Navbar />

      <main className="flex-grow py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-slate-800 tracking-[0.2em] uppercase mb-4">
              CHAT WITH ZENLY
            </h1>
            <p className="text-xl text-slate-500 italic">
              Whatever you're feeling is okay.
            </p>
            <p className="text-slate-400 mt-2">
              Talk it out. Sometimes a small conversation makes a big difference.
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={() => handleQuickAction('stressed')}
              className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-all"
            >
              😰 Stressed
            </button>
            <button
              onClick={() => handleQuickAction('sad')}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-all"
            >
              😢 Sad
            </button>
            <button
              onClick={() => handleQuickAction('anxious')}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-all"
            >
              😟 Anxious
            </button>
            <button
              onClick={() => handleQuickAction('happy')}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-all"
            >
              😊 Happy
            </button>
            <button
              onClick={() => handleQuickAction('tired')}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm hover:bg-yellow-200 transition-all"
            >
              😴 Tired
            </button>
            <button
              onClick={() => handleQuickAction('help')}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-all"
            >
              🆘 Need Help
            </button>
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🤖</span>
                </div>
                <div>
                  <h2 className="font-semibold">Zenly Assistant</h2>
                  <p className="text-xs opacity-80">Online • Here to listen</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="h-[400px] overflow-y-auto p-6 bg-slate-50"
            >
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

          {/* Example conversation */}
          <div className="mt-8 bg-indigo-50 p-6 rounded-2xl">
            <p className="text-sm text-indigo-800 mb-2">💬 Example conversation:</p>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">You:</span> I am feeling a bit stressed today 😭 Can we talk for a moment?</p>
              <p><span className="font-semibold">Zenly:</span> Sure, it sounds like you're carrying a lot right now. Let's break it down together. What's one small step you could take today to move forward?</p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">
            <p>Your conversations are private and confidential 💚</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatPage;