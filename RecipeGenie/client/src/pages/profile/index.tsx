import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  User,
  MapPin,
  Link as LinkIcon,
  Briefcase,
  GraduationCap,
  Save,
  Plus,
  X
} from "lucide-react";

const INDUSTRIES = [
  'TECHNOLOGY', 'FINANCE', 'HEALTHCARE', 'MARKETING', 'SALES', 
  'EDUCATION', 'CONSULTING', 'LEGAL', 'ENGINEERING', 'DESIGN', 'OTHER'
];

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin', 'Portuguese',
  'Arabic', 'Hindi', 'Japanese', 'Korean', 'Italian', 'Dutch'
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Mentor-specific fields
  const [yearsExperience, setYearsExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  // Mentee-specific fields
  const [school, setSchool] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [currentProfession, setCurrentProfession] = useState('');
  const [targetProfession, setTargetProfession] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Load profile data into form when available
  useEffect(() => {
    if (profile?.profile) {
      const p = profile.profile;
      setLocation(p.location || '');
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setLinkedin(p.linkedin || '');
      setSkills(p.skills || []);
      setIndustries(p.industries || []);
      setLanguages(p.languages || []);
      setYearsExperience(p.yearsExperience?.toString() || '');
      setAvailability(p.availability || '');
      setMeetingLink(p.meetingLink || '');
      setSpecialties(p.specialties || []);
      setSchool(p.school || '');
      setSchoolYear(p.schoolYear || '');
      setMajor(p.major || '');
      setMinor(p.minor || '');
      setCurrentProfession(p.currentProfession || '');
      setTargetProfession(p.targetProfession || '');
    }
  }, [profile]);

  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest('POST', '/api/profile', profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Saved!",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    const profileData = {
      location: location.trim() || undefined,
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      skills: skills.length > 0 ? skills : undefined,
      industries: industries.length > 0 ? industries : undefined,
      languages: languages.length > 0 ? languages : undefined,
      // Mentor fields
      yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
      availability: availability.trim() || undefined,
      meetingLink: meetingLink.trim() || undefined,
      specialties: specialties.length > 0 ? specialties : undefined,
      // Mentee fields
      school: school.trim() || undefined,
      schoolYear: schoolYear.trim() || undefined,
      major: major.trim() || undefined,
      minor: minor.trim() || undefined,
      currentProfession: currentProfession.trim() || undefined,
      targetProfession: targetProfession.trim() || undefined,
    };

    saveProfileMutation.mutate(profileData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialtyToRemove: string) => {
    setSpecialties(specialties.filter(specialty => specialty !== specialtyToRemove));
  };

  const addIndustry = (industry: string) => {
    if (!industries.includes(industry)) {
      setIndustries([...industries, industry]);
    }
  };

  const removeIndustry = (industryToRemove: string) => {
    setIndustries(industries.filter(industry => industry !== industryToRemove));
  };

  const addLanguage = (language: string) => {
    if (!languages.includes(language)) {
      setLanguages([...languages, language]);
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(language => language !== languageToRemove));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
                  My Profile
                </h1>
                <p className="text-muted-foreground">
                  Complete your profile to get better mentor matches and opportunities.
                </p>
              </div>
              <Button
                onClick={handleSaveProfile}
                disabled={saveProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
                <TabsTrigger value="professional" data-testid="tab-professional">Professional</TabsTrigger>
                {user?.role === 'MENTOR' && (
                  <TabsTrigger value="mentor" data-testid="tab-mentor">Mentor Info</TabsTrigger>
                )}
                {user?.role === 'MENTEE' && (
                  <TabsTrigger value="mentee" data-testid="tab-mentee">Education</TabsTrigger>
                )}
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card data-testid="card-basic-info">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="text-lg">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-lg">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <Badge variant="outline" className="mt-2">
                          {user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="e.g. San Francisco, CA"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="pl-10"
                            data-testid="input-location"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">LinkedIn Profile</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            placeholder="https://linkedin.com/in/username"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="pl-10"
                            data-testid="input-linkedin"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Professional Headline</label>
                      <Input
                        placeholder="e.g. Senior Software Engineer at Google"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        data-testid="input-headline"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea
                        placeholder="Tell us about yourself, your experience, and your goals..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="min-h-[120px]"
                        data-testid="textarea-bio"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Tab */}
              <TabsContent value="professional" className="space-y-6">
                <Card data-testid="card-professional-info">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Skills */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Skills</label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          data-testid="input-new-skill"
                        />
                        <Button onClick={addSkill} data-testid="button-add-skill">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeSkill(skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Industries */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Industries</label>
                      <Select onValueChange={addIndustry}>
                        <SelectTrigger data-testid="select-industry">
                          <SelectValue placeholder="Add an industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.filter(industry => !industries.includes(industry)).map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry.charAt(0) + industry.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {industries.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {industries.map((industry) => (
                            <Badge key={industry} variant="default" className="flex items-center gap-1">
                              {industry.charAt(0) + industry.slice(1).toLowerCase()}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeIndustry(industry)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Languages</label>
                      <Select onValueChange={addLanguage}>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue placeholder="Add a language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.filter(language => !languages.includes(language)).map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {languages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {languages.map((language) => (
                            <Badge key={language} variant="outline" className="flex items-center gap-1">
                              {language}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeLanguage(language)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Mentor Tab */}
              {user?.role === 'MENTOR' && (
                <TabsContent value="mentor" className="space-y-6">
                  <Card data-testid="card-mentor-info">
                    <CardHeader>
                      <CardTitle>Mentor Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Years of Experience</label>
                          <Input
                            type="number"
                            placeholder="e.g. 5"
                            value={yearsExperience}
                            onChange={(e) => setYearsExperience(e.target.value)}
                            data-testid="input-years-experience"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Meeting Link</label>
                          <Input
                            placeholder="Cal.com, Calendly, or Zoom link"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            data-testid="input-meeting-link"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Availability</label>
                        <Textarea
                          placeholder="Describe your availability (e.g., Weekdays 9 AM - 5 PM PST)"
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          data-testid="textarea-availability"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium">Specialties</label>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Add a specialty"
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                            data-testid="input-new-specialty"
                          />
                          <Button onClick={addSpecialty} data-testid="button-add-specialty">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                                {specialty}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => removeSpecialty(specialty)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Mentee Tab */}
              {user?.role === 'MENTEE' && (
                <TabsContent value="mentee" className="space-y-6">
                  <Card data-testid="card-education-info">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Education & Career Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">School/University</label>
                          <Input
                            placeholder="e.g. Stanford University"
                            value={school}
                            onChange={(e) => setSchool(e.target.value)}
                            data-testid="input-school"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Year/Level</label>
                          <Input
                            placeholder="e.g. Junior, Graduate, Alumni"
                            value={schoolYear}
                            onChange={(e) => setSchoolYear(e.target.value)}
                            data-testid="input-school-year"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Major</label>
                          <Input
                            placeholder="e.g. Computer Science"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            data-testid="input-major"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Minor</label>
                          <Input
                            placeholder="e.g. Business Administration"
                            value={minor}
                            onChange={(e) => setMinor(e.target.value)}
                            data-testid="input-minor"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Current Profession</label>
                          <Input
                            placeholder="e.g. Software Intern"
                            value={currentProfession}
                            onChange={(e) => setCurrentProfession(e.target.value)}
                            data-testid="input-current-profession"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Profession</label>
                          <Input
                            placeholder="e.g. Senior Software Engineer"
                            value={targetProfession}
                            onChange={(e) => setTargetProfession(e.target.value)}
                            data-testid="input-target-profession"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
