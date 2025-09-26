"use client";
import AuthButtons from "@/components/AuthButtons";
import InkeepWidget from "@/components/InkeepWidget";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Listen for Inkeep custom actions
    const handleStartSession = (event: CustomEvent) => {
      console.log('Inkeep triggered start session:', event.detail);
      setShowAuth(true);
    };

    const handleSetDuration = (event: CustomEvent) => {
      console.log('Inkeep triggered set duration:', event.detail);
    };

    const handleExplainMeditation = () => {
      console.log('Inkeep triggered explain meditation');
      // Show a modal or redirect to help section
    };

    window.addEventListener('inkeep-start-session', handleStartSession as EventListener);
    window.addEventListener('inkeep-set-duration', handleSetDuration as EventListener);
    window.addEventListener('inkeep-explain-meditation', handleExplainMeditation);

    return () => {
      window.removeEventListener('inkeep-start-session', handleStartSession as EventListener);
      window.removeEventListener('inkeep-set-duration', handleSetDuration as EventListener);
      window.removeEventListener('inkeep-explain-meditation', handleExplainMeditation);
    };
  }, []);

  if (showAuth) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <img
                  src="/squish_logo.png"
                  alt="Squish Logo"
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback to emoji if logo not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <span className="text-2xl hidden">🧘</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Squish</h1>
              <p className="text-gray-600">Your AI voice meditation guide</p>
            </div>
            <AuthButtons />
          </div>
        </div>
        <InkeepWidget />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/squish_logo.png"
              alt="Squish Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback to emoji if logo not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hidden">
              <span className="text-lg">🧘</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Squish</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </div>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Try for free
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              The most fun way to fix your mental health
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI voice meditation that helps you resolve the thoughts and feelings that hold you back
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Try for free
              </button>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 font-semibold text-lg flex items-center group"
              >
                How it works →
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Content - Meditation Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/relaxed-female-professional-sitting-with-eyes-closed-while-taking-break-from-work-at-home-SBOF03740.jpg"
                alt="Woman meditating at her desk with laptop and nature view"
                className="w-full h-96 object-cover"
                onError={(e) => {
                  // Fallback to CSS representation if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              {/* Fallback CSS representation */}
              <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 relative hidden">
                {/* Window with nature view */}
                <div className="absolute top-6 left-6 w-40 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-xl border-4 border-white shadow-lg">
                  <div className="w-full h-full bg-gradient-to-b from-green-300 to-green-400 rounded-lg flex items-end justify-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full mb-3"></div>
                  </div>
                </div>
                
                {/* Desk */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-amber-200 to-amber-100">
                  {/* Laptop */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-gray-300 rounded-lg shadow-lg">
                    <div className="w-full h-2 bg-gray-400 rounded-lg"></div>
                  </div>
                  
                  {/* Meditation person - woman relaxing */}
                  <div className="absolute bottom-20 right-12 w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-3xl">🧘‍♀️</span>
                  </div>
                  
                  {/* Desk items - plant, mug, phone */}
                  <div className="absolute bottom-8 left-12 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="absolute bottom-8 left-20 w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="absolute bottom-10 left-16 w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                
                {/* Floating meditation elements */}
                <div className="absolute top-12 right-12 w-6 h-6 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-4 h-4 bg-pink-300 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-16 right-8 w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-500"></div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
            
            {/* Floating Squish Logo */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
              <img
                src="/squish_logo.png"
                alt="Squish Logo"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  // Fallback to robot emoji if logo not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center hidden">
                <span className="text-3xl">🤖</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-xl text-gray-600">Simple steps to start your meditation journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">1. Sign up</h3>
              <p className="text-gray-600">Enter your email and get a magic link to access your account</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">2. Choose duration</h3>
              <p className="text-gray-600">Select 5, 10, 15, or 20 minutes for your meditation session</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">3. Start talking</h3>
              <p className="text-gray-600">Begin your voice meditation with our AI guide, Squish</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why choose Squish?</h2>
            <p className="text-xl text-gray-600">Experience the future of meditation</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Guidance</h3>
              <p className="text-gray-600">Get personalized meditation guidance from our advanced AI assistant</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Sessions</h3>
              <p className="text-gray-600">Choose from 5 to 20-minute sessions that fit your schedule</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Web-Based</h3>
              <p className="text-gray-600">No app downloads needed - access everything in your browser</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What our users say</h2>
            <p className="text-xl text-gray-600">Real stories from people who found peace with Squish</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/testimonial.png"
                alt="User testimonials and reviews"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback to CSS representation if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              {/* Fallback CSS representation */}
              <div className="w-full h-64 bg-gradient-to-br from-yellow-50 to-orange-50 relative hidden flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">User Testimonials</h3>
                  <p className="text-gray-600">Real stories from our community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-yellow-400 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to start your journey?</h2>
          <p className="text-xl text-gray-700 mb-8">Join thousands of users who have transformed their mental health</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start your free session now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/squish_logo.png"
                  alt="Squish Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback to emoji if logo not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center hidden">
                  <span className="text-lg">🧘</span>
                </div>
                <span className="text-xl font-bold">Squish</span>
              </div>
              <p className="text-gray-400">AI voice meditation for better mental health</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Email</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Squish. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <InkeepWidget />
    </main>
  );
}