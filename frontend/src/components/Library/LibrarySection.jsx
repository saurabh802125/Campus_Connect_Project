import React from 'react';
import { Plus, X, Search, User, Mail, Phone } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Badge from '../UI/Badge';
import { skillAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const popularSkills = [
  "JavaScript", "Python", "React", "Java", "Machine Learning",
  "UI/UX Design", "Node.js", "Database Design", "DevOps", "Data Science"
];

const SkillMatchingSection = () => {
  const [searchSkill, setSearchSkill] = React.useState("");
  const [newSkill, setNewSkill] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const { user, updateUserSkills } = useAuth();
  const userSkills = user?.skills || [];

  const handleAddSkill = async () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      try {
        const updatedSkills = [...userSkills, newSkill.trim()];
        await updateUserSkills(updatedSkills);
        setNewSkill("");
      } catch (error) {
        setError('Failed to add skill');
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    try {
      const updatedSkills = userSkills.filter(skill => skill !== skillToRemove);
      await updateUserSkills(updatedSkills);
    } catch (error) {
      setError('Failed to remove skill');
    }
  };

  const handleSearchSkill = async () => {
    if (searchSkill.trim()) {
      setLoading(true);
      try {
        const results = await skillAPI.searchUsers(searchSkill.trim());
        setSearchResults(results);
      } catch (error) {
        setError('Failed to search users');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkillClick = async (skill) => {
    setSearchSkill(skill);
    setLoading(true);
    try {
      const results = await skillAPI.searchUsers(skill);
      setSearchResults(results);
    } catch (error) {
      setError('Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPopularSkill = async (skill) => {
    if (!userSkills.includes(skill)) {
      try {
        const updatedSkills = [...userSkills, skill];
        await updateUserSkills(updatedSkills);
      } catch (error) {
        setError('Failed to add skill');
      }
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Skills Profile</CardTitle>
          <CardDescription>Add your skills to help others find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill (e.g., React, Python, Design)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button onClick={handleAddSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-2">
                {skill}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => handleRemoveSkill(skill)}
                />
              </Badge>
            ))}
          </div>

          <div>
            <label className="text-sm text-gray-600">Popular Skills:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleAddPopularSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Find Students by Skill</CardTitle>
          <CardDescription>Search for students who have specific skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search for a skill (e.g., React, Machine Learning)"
              value={searchSkill}
              onChange={(e) => setSearchSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSkill()}
            />
            <Button onClick={handleSearchSkill} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="text-sm text-gray-600">Quick Search:</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSkillClick(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center">Searching for students...</div>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students with "{searchSkill}" skill</CardTitle>
            <CardDescription>{searchResults.length} student(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((student) => (
                <Card key={student._id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-gray-600">{student.studentId}</p>
                      </div>

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

                      <div className="flex flex-col space-y-1 text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{student.email}</span>
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

      {searchSkill && searchResults.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500">No students found with "{searchSkill}" skill</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillMatchingSection;
