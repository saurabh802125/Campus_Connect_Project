// frontend/src/components/Skills/SkillMatchingSection.jsx
import React, { useState } from 'react';
import { Plus, X, Search, User, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Badge from '../UI/Badge';
import { skillAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const popularSkills = [
  "JavaScript", "Python", "React", "Java", "Machine Learning",
  "UI/UX Design", "Node.js", "Database Design", "DevOps", "Data Science",
  "C++", "HTML/CSS", "MongoDB", "SQL", "AWS", "Docker", "Git",
  "Angular", "Vue.js", "PHP", "Ruby", "Swift", "Kotlin", "Flutter"
];

const SkillMatchingSection = () => {
  const [searchSkill, setSearchSkill] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, updateUserSkills } = useAuth();
  const userSkills = user?.skills || [];

  const handleAddSkill = async () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      try {
        setError(null);
        const updatedSkills = [...userSkills, newSkill.trim()];
        await updateUserSkills(updatedSkills);
        setNewSkill("");
      } catch (error) {
        setError('Failed to add skill');
        console.error('Error adding skill:', error);
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      setError(null);
      const updatedSkills = userSkills.filter(skill => skill !== skillToRemove);
      await updateUserSkills(updatedSkills);
    } catch (error) {
      setError('Failed to remove skill');
      console.error('Error removing skill:', error);
    }
  };

  const handleSearchSkill = async () => {
    if (searchSkill.trim()) {
      setLoading(true);
      setError(null);
      try {
        const results = await skillAPI.searchUsers(searchSkill.trim());
        setSearchResults(results);
      } catch (error) {
        setError('Failed to search users');
        setSearchResults([]);
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkillClick = async (skill) => {
    setSearchSkill(skill);
    setLoading(true);
    setError(null);
    try {
      const results = await skillAPI.searchUsers(skill);
      setSearchResults(results);
    } catch (error) {
      setError('Failed to search users');
      setSearchResults([]);
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPopularSkill = async (skill) => {
    if (!userSkills.includes(skill)) {
      try {
        setError(null);
        const updatedSkills = [...userSkills, skill];
        await updateUserSkills(updatedSkills);
      } catch (error) {
        setError('Failed to add skill');
        console.error('Error adding popular skill:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* My Skills Profile */}
      <Card>
        <CardHeader>
          <CardTitle>My Skills Profile</CardTitle>
          <CardDescription>Add your skills to help others find you for collaboration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill (e.g., React, Python, Design)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill} disabled={!newSkill.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* User's Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Your Skills:</label>
            <div className="flex flex-wrap gap-2">
              {userSkills.length > 0 ? (
                userSkills.map((skill, index) => (
                  <Badge key={index} variant="default" className="px-3 py-1 flex items-center gap-2">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No skills added yet. Add some skills to get started!</p>
              )}
            </div>
          </div>

          {/* Popular Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Popular Skills (click to add):</label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant={userSkills.includes(skill) ? "secondary" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    userSkills.includes(skill) 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => !userSkills.includes(skill) && handleAddPopularSkill(skill)}
                >
                  {skill} {userSkills.includes(skill) && "✓"}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Find Students by Skill */}
      <Card>
        <CardHeader>
          <CardTitle>Find Students by Skill</CardTitle>
          <CardDescription>Search for students who have specific skills for collaboration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for a skill (e.g., React, Machine Learning)"
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSkill()}
            />
            <Button onClick={handleSearchSkill} disabled={loading || !searchSkill.trim()}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quick Search:</label>
            <div className="flex flex-wrap gap-2">
              {popularSkills.slice(0, 10).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching for students...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students with "{searchSkill}" skill</CardTitle>
            <CardDescription>{searchResults.length} student(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((student) => (
                <Card key={student._id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1">
                        {student.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant={skill.toLowerCase().includes(searchSkill.toLowerCase()) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && searchSkill && searchResults.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found with "{searchSkill}" skill</p>
            <p className="text-sm text-gray-400 mt-2">Try searching for a different skill or check the spelling</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillMatchingSection;