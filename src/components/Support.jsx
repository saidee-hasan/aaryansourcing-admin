import React, { useState, useEffect, useRef } from 'react';

function Support() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: 'Welcome to Premium Support! How can we assist you today?', 
      sender: 'agent', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      status: 'read',
      agent: {
        name: 'Sarah Johnson',
        role: 'Senior Support Specialist',
        avatar: 'SJ',
        verified: true
      }
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Changed to 768px breakpoint
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isChatOpen) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }, 1000);
    }
  }, [isChatOpen, messages]);

  // Handle mobile viewport height changes (keyboard appearing)
  useEffect(() => {
    if (!isMobile) return;
    
    const handleViewportChange = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    
    window.addEventListener('resize', handleViewportChange);
    return () => window.removeEventListener('resize', handleViewportChange);
  }, [isMobile]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        attachments: [...attachments]
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      setAttachments([]);

      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: prev.length + 1,
            text: 'Thank you for your message. Your case has been escalated to our priority support team.',
            sender: 'agent',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            agent: {
              name: 'Michael Chen',
              role: 'Priority Support Manager',
              avatar: 'MC',
              verified: true,
              supervisor: true
            }
          }]);
        }, 2000);
      }, 1000);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className={`fixed ${isMobile ? (isChatOpen ? 'inset-0' : 'bottom-8 right-8') : 'bottom-8 right-8'} z-50 font-sans`}>
      {!isChatOpen ? (
        <button 
          onClick={() => setIsChatOpen(true)}
          className={`bg-gradient-to-br from-blue-700 to-purple-600 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:scale-110 hover:rotate-12 duration-300 ${
            isMobile ? 'fixed bottom-8 right-8' : ''
          }`}
          aria-label="Open support chat"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-ping-slow pointer-events-none"></div>
        </button>
      ) : (
        <div className={`bg-white rounded-xl shadow-2xl ${isMobile ? 'w-full h-full rounded-none' : 'w-[90vw] max-w-[500px] h-[90vh] max-h-[700px]'} flex flex-col border border-gray-100`}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                  {'MC'}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Priority Support
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </h3>
                <p className="text-xs font-medium text-white/80 flex items-center gap-1">
                  {isTyping ? (
                    <span className="flex items-center">
                      <span className="animate-pulse">Senior agent typing</span>
                      <span className="ml-1 flex">
                        <span className="animate-bounce mx-0.5">.</span>
                        <span className="animate-bounce mx-0.5 delay-100">.</span>
                        <span className="animate-bounce mx-0.5 delay-200">.</span>
                      </span>
                    </span>
                  ) : (
                    'Guaranteed response time < 2 minutes'
                  )}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-white/10 rounded-xl p-2 transition-colors"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center mb-6">
              <div className="inline-block bg-blue-50 text-blue-800 text-sm px-4 py-1 rounded-full">
                Conversation started • Today at {messages[0].time}
              </div>
            </div>

            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-6 group`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-2xl relative ${
                    msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg'
                    : 'bg-white border border-gray-200 shadow-md'
                  }`}
                >
                  {msg.agent && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`text-sm font-semibold ${
                        msg.agent.supervisor 
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-transparent bg-clip-text'
                          : 'text-gray-700'
                      }`}>
                        {msg.agent.name}
                        {msg.agent.verified && (
                          <svg className="w-4 h-4 ml-1 inline-block text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{msg.agent.role}</span>
                    </div>
                  )}
                  
                  <p className="break-words text-[15px] leading-relaxed">{msg.text}</p>
                  
                  {msg.attachments?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 bg-white/10 p-2 rounded-lg">
                          <div className="flex-shrink-0">
                            {file.preview ? (
                              <img src={file.preview} alt={file.name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className={`text-xs ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.time}
                    </p>
                    <div className="flex items-center gap-2">
                      {msg.sender === 'user' && (
                        <span className="text-xs">
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && (
                            <span className="text-blue-300">✓✓</span>
                          )}
                        </span>
                      )}
                      <button className="opacity-0 group-hover:opacity-100 text-current hover:text-blue-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12l8-8-8-8"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-6">
                <div className="max-w-[80%] p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white space-y-3" ref={inputRef}>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
                    <span className="text-sm text-gray-600 truncate max-w-[120px]">{file.name}</span>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 hover:border-blue-400 transition-colors bg-gray-50 text-base"
                />
                <div className="absolute right-2 top-3 flex gap-2">
                  <label className="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                    </svg>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={!message.trim() && attachments.length === 0}
                className={`px-5 py-3 rounded-xl transition-all ${
                  (message.trim() || attachments.length > 0)
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                } flex items-center gap-2`}
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center justify-between flex-wrap gap-1">
              <span className="whitespace-nowrap">24/7 Priority Support • Avg. Response Time: 1m 23s</span>
              <div className="flex items-center gap-2">
                <button type="button" className="hover:text-blue-600 whitespace-nowrap">
                  Privacy
                </button>
                <span>•</span>
                <button type="button" className="hover:text-blue-600 whitespace-nowrap">
                  Security
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default Support;