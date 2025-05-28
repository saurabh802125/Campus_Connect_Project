import React, { useState } from 'react';
import { Calendar, BookOpen, Users, UserCheck, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/UI/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/UI/Tabs';
import Button from './components/UI/Button';
import AuthModal from './components/Auth/AuthModal';
import LibrarySection from './components/Library/LibrarySection';
import EventsSection from './components/Events/EventsSection';
import SkillMatchingSection from './components/Skills/SkillMatchingSection';

const MainApp = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const { user, isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-900">Campus Connect</CardTitle>
            <CardDescription>Seat Allocation & Skill Matching Platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-800">Library Seat Booking</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Event Seat Allocation</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-purple-800">Skill Matching</span>
              </div>
            </div>
            <Button 
              onClick={() => setShowAuthModal(true)} 
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Campus Connect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="library" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Library</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Skill Matching</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library">
            <LibrarySection />
          </TabsContent>

          <TabsContent value="events">
            <EventsSection />
          </TabsContent>

          <TabsContent value="skills">
            <SkillMatchingSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;