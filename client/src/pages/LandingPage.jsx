import React, { useEffect, useState } from 'react'
import {CheckCircle, Zap, Brain, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const LandingPage = () => {

    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setIsVisible(true); 
    }, []);
    const Navigate =  useNavigate()

    const handleSignupClick = () => {
      Navigate('/signup');
    };

    const handleLoginClick = () => {
      Navigate('/login');
    };

    const features = [
        {
          icon: <Brain className="w-8 h-8 text-red-500" />,
          title: "AI-Powered Intelligence",
          description: "Advanced algorithms that learn your workflow and optimize task management automatically."
        },
        {
          icon: <Target className="w-8 h-8 text-red-500" />,
          title: "Smart Prioritization",
          description: "Automatically prioritize tasks based on deadlines, importance, and your productivity patterns."
        },
        {
          icon: <Zap className="w-8 h-8 text-red-500" />,
          title: "Lightning Fast",
          description: "Instant task creation, updates, and insights powered by cutting-edge AI technology."
        }
      ];

  return (
    <div>
        {/* navbar */}
        <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <img src="/flowai-logo.png" alt="" />
              </div>
              <span className="text-xl font-bold">Flow AI</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
            
              
              <button onClick={handleSignupClick} className="text-white hover:bg-gray-800 px-5 py-2 rounded-lg pointer">
              Sign In
              </button>
              
             
              <button onClick={handleLoginClick} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg">
                Login
              </button>
            </div>
          </div>
        </div>
      </header>
      


        {/* hero section */}
        
      <section className="relative min-h-screen flex items-center justify-center">

        
   
        <div className="absolute inset-0 overflow-hidden">

          
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-900/10"></div>

            
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>

          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* site down badge */}
          <div className="fade-in">
            <div className="inline-flex items-center gap-3 bg-red-500/20 border     border-primary/20 rounded-full px-6 py-3 mb-7">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Improving Things… Be Right Back!</span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
 
            Flow Ai
          </h1>
          
          <p className={`text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            Enterprise-grade AI that learns, adapts, and optimizes your workflow to boost productivity and eliminate chaos.
          </p>
          
          <div className={`flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            
            <input type="email" 
            placeholder="Enter your Email" 
            className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 w-full sm:w-80 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md my-2 p-2" />
        
            <button onClick={handleSignupClick} className="flex bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-md w-full sm:w-auto">
                Start with Flow AI
            </button>
          </div>
          
          <div className={`flex items-center justify-center space-x-6 text-sm text-gray-400 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-red-500">Flow AI</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of task management with AI that understands your needs and adapts to your workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 hover:border-red-500/50 transition-all duration-300 hover:scale-105">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


        {/* footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <img src="/flowai-logo.png" alt="" />
              </div>
              <span className="text-xl font-bold">Flow AI</span>
            </div>
            
            
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Flow AI. All rights reserved. Created By Atharva Patil</p>
          </div>
        </div>
      </footer>


    </div>
  )
}

export default LandingPage