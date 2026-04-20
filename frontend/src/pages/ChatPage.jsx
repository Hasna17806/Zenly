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
        setMessages([
          {
            _id: 'welcome1',
            message: "Hi 👋 How are you feeling today?",
            sender: "bot",
            createdAt: new Date().toISOString()
          },
          {
            _id: 'welcome2',
            message: "I'm here to listen. Whatever you're going through, you're not alone.",
            sender: "bot",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([
        {
          _id: 'welcome1',
          message: "Hi 👋 How are you feeling today?",
          sender: "bot",
          createdAt: new Date().toISOString()
        },
        {
          _id: 'welcome2',
          message: "I'm here to listen. Whatever you're going through, you're not alone.",
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

      setMessages(prev => {
        const withoutTemp = prev.filter(msg => !msg._id.toString().startsWith('temp-'));
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

  const handleQuickAction = (action) => {
    const quickMessages = {
      'stressed': "I'm feeling a bit stressed today. Can we talk for a moment?",
      'sad': "I'm feeling a bit down today. Could use someone to talk to.",
      'anxious': "I'm feeling anxious about everything right now.",
      'happy': "I'm feeling really great today! Just wanted to share.",
      'tired': "I'm feeling exhausted and overwhelmed.",
      'help': "I need some help coping with everything."
    };
    
    setInputMessage(quickMessages[action] || quickMessages.stressed);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex flex-col">
        <Navbar />
        <main className="flex-grow py-20 px-6 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
            <p className="mt-4 text-teal-600">Loading your conversation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex flex-col">
      <Navbar />

      <main className="flex-grow py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-600 to-purple-600 rounded-2xl shadow-lg mb-6">
              <span className="text-4xl">🤖</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-3 tracking-tight">
              Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600">Zenly</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A safe space to express yourself. Your feelings matter, and you're never alone.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => handleQuickAction('stressed')}
              className="group px-5 py-2.5 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 rounded-full text-sm font-medium hover:from-orange-200 hover:to-orange-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">😰</span> Stressed
            </button>
            <button
              onClick={() => handleQuickAction('sad')}
              className="group px-5 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-sm font-medium hover:from-blue-200 hover:to-blue-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">😢</span> Sad
            </button>
            <button
              onClick={() => handleQuickAction('anxious')}
              className="group px-5 py-2.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-full text-sm font-medium hover:from-purple-200 hover:to-purple-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">😟</span> Anxious
            </button>
            <button
              onClick={() => handleQuickAction('happy')}
              className="group px-5 py-2.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-full text-sm font-medium hover:from-green-200 hover:to-green-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">😊</span> Happy
            </button>
            <button
              onClick={() => handleQuickAction('tired')}
              className="group px-5 py-2.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 rounded-full text-sm font-medium hover:from-amber-200 hover:to-amber-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">😴</span> Tired
            </button>
            <button
              onClick={() => handleQuickAction('help')}
              className="group px-5 py-2.5 bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 rounded-full text-sm font-medium hover:from-rose-200 hover:to-rose-100 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span className="mr-2">🆘</span> Need Help
            </button>
          </div>

          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-teal-600 to-purple-600 p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                    🤖
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Zenly Assistant</h2>
                  <p className="text-xs opacity-80 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Online • Here to listen
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={chatContainerRef}
              className="h-[450px] overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white"
            >
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={message._id || idx}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    {message.sender !== 'user' && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm shadow-md">
                          🤖
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-br-none shadow-lg'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-teal-100' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm shadow-md">
                          👤
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm shadow-md">
                        🤖
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-md">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"></span>
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-5 bg-white border-t border-gray-100">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full px-5 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-purple-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    Send
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Helpful Tips */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">💬</span>
                <h3 className="font-semibold text-teal-800">Example Conversation</h3>
              </div>
              <div className="space-y-2 text-sm text-teal-700">
                <p><span className="font-medium">You:</span> I've been feeling really overwhelmed lately.</p>
                <p><span className="font-medium">Zenly:</span> I hear you. It's okay to feel that way. Want to talk about what's been on your mind?</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔒</span>
                <h3 className="font-semibold text-purple-800">Private & Confidential</h3>
              </div>
              <p className="text-sm text-purple-700">
                Your conversations are completely private and secure. This is a safe space where you can express yourself freely without judgment.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;