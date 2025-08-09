import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Video
} from "lucide-react";

const SESSION_TYPES = [
  { value: 'MENTORSHIP', label: 'General Mentorship', duration: '60 min', description: 'Career guidance and advice session' },
  { value: 'RESUME_REVIEW', label: 'Resume Review', duration: '30 min', description: 'Professional resume feedback and improvement' },
  { value: 'MOCK_INTERVIEW', label: 'Mock Interview', duration: '45 min', description: 'Practice interview with feedback' },
];

export default function BookSession() {
  const { mentorId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: mentor, isLoading } = useQuery({
    queryKey: [`/api/mentors/${mentorId}`],
    enabled: !!mentorId,
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      return apiRequest('POST', '/api/sessions', sessionData);
    },
    onSuccess: () => {
      toast({
        title: "Session Booked!",
        description: "Your mentorship session has been successfully booked. You'll receive a confirmation email shortly.",
      });
      setLocation('/');
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
        title: "Booking Failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 md:ml-64">
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-12" data-testid="card-mentor-not-found">
                <CardContent>
                  <h3 className="text-lg font-semibold mb-2">Mentor Not Found</h3>
                  <p className="text-muted-foreground mb-4">
                    The mentor you're trying to book a session with doesn't exist.
                  </p>
                  <Link href="/mentors">
                    <Button>Browse All Mentors</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleBookSession = () => {
    if (!selectedType || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to book your session.",
        variant: "destructive",
      });
      return;
    }

    const startsAt = new Date(`${selectedDate}T${selectedTime}`);
    const sessionType = SESSION_TYPES.find(type => type.value === selectedType);
    const durationMinutes = sessionType?.value === 'RESUME_REVIEW' ? 30 : 
                           sessionType?.value === 'MOCK_INTERVIEW' ? 45 : 60;
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);

    bookSessionMutation.mutate({
      mentorId,
      type: selectedType,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      notes: notes.trim() || undefined,
    });
  };

  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const initials = `${mentor.firstName?.charAt(0) || ''}${mentor.lastName?.charAt(0) || ''}`;

  // Generate available time slots (simplified - in real app, would come from mentor's availability)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 17) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:ml-64">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <Link href={`/mentors/${mentorId}`}>
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
                Book a Session
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor Info */}
              <Card data-testid="card-mentor-info">
                <CardHeader>
                  <CardTitle>Session with</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mentor.profileImageUrl} alt={fullName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{fullName}</h3>
                      {mentor.profile?.headline && (
                        <p className="text-muted-foreground">{mentor.profile.headline}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {mentor.profile?.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {mentor.profile.location}
                          </div>
                        )}
                        {mentor.avgRating && (
                          <div className="flex items-center">
                            ⭐ {mentor.avgRating.toFixed(1)} rating
                          </div>
                        )}
                      </div>
                      {mentor.profile?.specialties && mentor.profile.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mentor.profile.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card data-testid="card-booking-form">
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Session Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Type *</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger data-testid="select-session-type">
                        <SelectValue placeholder="Choose session type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SESSION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {type.duration} • {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      data-testid="input-date"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time *</label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger data-testid="select-time">
                        <SelectValue placeholder="Choose time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Notes (Optional)</label>
                    <Textarea
                      placeholder="What would you like to discuss? Any specific questions or topics?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="textarea-notes"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Summary & Booking */}
            {selectedType && selectedDate && selectedTime && (
              <Card data-testid="card-session-summary">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    Session Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Session Type:</span>
                      <p className="font-medium">
                        {SESSION_TYPES.find(t => t.value === selectedType)?.label}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">
                        {SESSION_TYPES.find(t => t.value === selectedType)?.duration}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">
                        {new Date(selectedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time:</span>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center text-sm">
                      <Video className="mr-2 h-4 w-4" />
                      <span>This session will be conducted via video call</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>You'll receive calendar invites and meeting details</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleBookSession}
                      disabled={bookSessionMutation.isPending}
                      size="lg"
                      className="flex-1"
                      data-testid="button-confirm-booking"
                    >
                      {bookSessionMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
