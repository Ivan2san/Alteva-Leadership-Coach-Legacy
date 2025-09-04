import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { lgp360ReportSchema, type LGP360ReportData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { BackButton } from "@/components/back-button";
import { FileText, Save, CheckCircle2, Upload, FileCheck, Loader2 } from "lucide-react";

export default function LGP360ReportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Fetch existing LGP360 data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/me"]
  });

  const userDataTyped = userData as { user?: { lgp360Data?: LGP360ReportData; lgp360UploadedAt?: string } } | undefined;
  const existingLGP360 = userDataTyped?.user?.lgp360Data;
  const hasExistingReport = !!existingLGP360;

  const form = useForm<LGP360ReportData>({
    resolver: zodResolver(lgp360ReportSchema),
    defaultValues: existingLGP360 || {
      currentRole: "",
      organization: "",
      yearsInLeadership: 0,
      teamSize: 0,
      industryExperience: "",
      primaryChallenges: [],
      leadershipGoals: [],
      communicationStyle: "",
      decisionMakingApproach: "",
      conflictResolutionStyle: "",
      motivationFactors: [],
      learningPreferences: [],
      strengths: [],
      growthAreas: [],
      previousCoaching: "",
      expectations: "",
      additionalNotes: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: LGP360ReportData) => {
      await apiRequest("/api/lgp360", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "LGP360 Report Saved",
        description: "Your leadership profile has been updated and will enhance your coaching experience.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save your LGP360 report",
        variant: "destructive",
      });
    },
  });

  // AI Document Processing Mutation
  const processDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/lgp360/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process document');
      }
      
      return response.json();
    },
    onSuccess: (data: LGP360ReportData) => {
      // Auto-populate form with AI-extracted data
      form.reset(data);
      toast({
        title: "Document Processed Successfully",
        description: "Your LGP360 report has been automatically filled from the uploaded document. Please review and edit as needed.",
      });
      setIsProcessingUpload(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Document Processing Failed",
        description: error.message || "Failed to process the uploaded document",
        variant: "destructive",
      });
      setIsProcessingUpload(false);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingUpload(true);
    processDocumentMutation.mutate(file);
  };

  const primaryChallengeOptions = [
    "Team Communication",
    "Strategic Decision Making",
    "Conflict Resolution",
    "Performance Management",
    "Change Management",
    "Time Management",
    "Delegation",
    "Building Trust",
    "Employee Engagement",
    "Work-Life Balance"
  ];

  const leadershipGoalOptions = [
    "Improve Communication Skills",
    "Enhance Team Productivity",
    "Develop Strategic Thinking",
    "Build Stronger Relationships",
    "Increase Emotional Intelligence",
    "Better Conflict Management",
    "Effective Change Leadership",
    "Coaching & Mentoring Skills",
    "Organizational Culture Building",
    "Innovation & Creativity"
  ];

  const motivationFactorOptions = [
    "Achievement",
    "Recognition",
    "Growth & Learning",
    "Making an Impact",
    "Building Relationships",
    "Autonomy",
    "Financial Rewards",
    "Work-Life Balance",
    "Helping Others",
    "Innovation"
  ];

  const learningPreferenceOptions = [
    "Hands-on Experience",
    "Reading & Research",
    "Mentoring & Coaching",
    "Peer Learning",
    "Formal Training",
    "Online Courses",
    "Workshops & Seminars",
    "Reflection & Journaling",
    "Case Studies",
    "Trial & Error"
  ];

  const onSubmit = (data: LGP360ReportData) => {
    saveMutation.mutate(data);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <BackButton />
          </div>

          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center mb-4">
                <FileText className="text-white" size={32} />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {hasExistingReport ? "Update Your LGP360 Report" : "Complete Your LGP360 Report"}
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {hasExistingReport 
                  ? "Update your leadership profile to ensure the AI coach provides the most personalized guidance."
                  : "Complete your leadership profile to unlock personalized AI coaching tailored to your unique style, challenges, and goals."
                }
              </CardDescription>
            </CardHeader>
          </Card>

          {hasExistingReport && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your LGP360 report was last updated on {userDataTyped?.user?.lgp360UploadedAt ? new Date(userDataTyped.user.lgp360UploadedAt).toLocaleDateString() : 'recently'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Document Upload */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Upload className="h-5 w-5" />
                Smart Upload
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Upload your existing LGP360 report or leadership assessment document and let AI automatically fill out the form for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isProcessingUpload ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        AI is analyzing your document...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <FileCheck className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                          Click to upload your LGP360 report
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Supports PDF, Word, and text files (max 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="file-upload-input"
                />
                
                <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                  Your document will be processed securely and deleted after analysis
                </p>
              </div>
            </CardContent>
          </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="currentRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Role/Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Manager, Team Lead, Director" {...field} data-testid="input-current-role" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Company or organization name" {...field} data-testid="input-organization" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="yearsInLeadership"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Leadership</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="5" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-years-leadership"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              placeholder="10" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-team-size"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="industryExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technology, Healthcare, Finance, Manufacturing" {...field} data-testid="input-industry" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Leadership Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary Leadership Challenges</CardTitle>
                  <CardDescription>Select all that apply to your current situation</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="primaryChallenges"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-2">
                          {primaryChallengeOptions.map((challenge) => (
                            <FormField
                              key={challenge}
                              control={form.control}
                              name="primaryChallenges"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={challenge}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(challenge)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, challenge])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== challenge
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-challenge-${challenge.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {challenge}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Leadership Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Leadership Development Goals</CardTitle>
                  <CardDescription>What do you want to improve or achieve?</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="leadershipGoals"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-2">
                          {leadershipGoalOptions.map((goal) => (
                            <FormField
                              key={goal}
                              control={form.control}
                              name="leadershipGoals"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={goal}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(goal)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, goal])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== goal
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-goal-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {goal}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Leadership Style */}
              <Card>
                <CardHeader>
                  <CardTitle>Leadership Style</CardTitle>
                  <CardDescription>Help us understand your approach to leadership</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="communicationStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-communication-style">
                              <SelectValue placeholder="Select your communication style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="direct">Direct & Assertive</SelectItem>
                            <SelectItem value="collaborative">Collaborative & Inclusive</SelectItem>
                            <SelectItem value="supportive">Supportive & Encouraging</SelectItem>
                            <SelectItem value="analytical">Analytical & Data-Driven</SelectItem>
                            <SelectItem value="inspirational">Inspirational & Visionary</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decisionMakingApproach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision Making Approach</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-decision-making">
                              <SelectValue placeholder="How do you typically make decisions?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="quick-decisive">Quick & Decisive</SelectItem>
                            <SelectItem value="consultative">Consultative & Inclusive</SelectItem>
                            <SelectItem value="analytical-thorough">Analytical & Thorough</SelectItem>
                            <SelectItem value="consensus-building">Consensus Building</SelectItem>
                            <SelectItem value="delegative">Delegative & Empowering</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="conflictResolutionStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conflict Resolution Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-conflict-resolution">
                              <SelectValue placeholder="How do you handle conflicts?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mediating">Mediating & Facilitating</SelectItem>
                            <SelectItem value="direct-confrontation">Direct Confrontation</SelectItem>
                            <SelectItem value="collaborative-problem-solving">Collaborative Problem Solving</SelectItem>
                            <SelectItem value="avoidance">Avoidance & De-escalation</SelectItem>
                            <SelectItem value="compromise-focused">Compromise Focused</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Personal Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Motivation & Learning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="motivationFactors"
                    render={() => (
                      <FormItem>
                        <FormLabel>What motivates you most? (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {motivationFactorOptions.map((factor) => (
                            <FormField
                              key={factor}
                              control={form.control}
                              name="motivationFactors"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={factor}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(factor)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, factor])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== factor
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-motivation-${factor.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {factor}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="learningPreferences"
                    render={() => (
                      <FormItem>
                        <FormLabel>Preferred Learning Methods (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {learningPreferenceOptions.map((preference) => (
                            <FormField
                              key={preference}
                              control={form.control}
                              name="learningPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={preference}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(preference)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, preference])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== preference
                                                )
                                              )
                                        }}
                                        data-testid={`checkbox-learning-${preference.toLowerCase().replace(/\s+/g, '-')}`}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {preference}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Self Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle>Self Assessment</CardTitle>
                  <CardDescription>Reflect on your current strengths and areas for growth</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="strengths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Strengths (List 3-5 strengths)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Strategic thinking, Team building, Communication..."
                            className="min-h-[80px]"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                            data-testid="textarea-strengths"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="growthAreas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas for Growth (List 3-5 areas to develop)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Delegation, Public speaking, Time management..."
                            className="min-h-[80px]"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                            data-testid="textarea-growth-areas"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Coaching Experience */}
              <Card>
                <CardHeader>
                  <CardTitle>Coaching & Development</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="previousCoaching"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Coaching Experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-previous-coaching">
                              <SelectValue placeholder="Have you worked with a coach before?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="never">Never worked with a coach</SelectItem>
                            <SelectItem value="limited">Limited coaching experience</SelectItem>
                            <SelectItem value="some">Some coaching experience</SelectItem>
                            <SelectItem value="extensive">Extensive coaching experience</SelectItem>
                            <SelectItem value="currently">Currently working with a coach</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What do you expect from AI coaching?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what you hope to achieve through AI-powered coaching sessions..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-expectations"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information that might help personalize your coaching experience..."
                            className="min-h-[80px]"
                            {...field}
                            data-testid="textarea-additional-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={saveMutation.isPending}
                    data-testid="button-save-lgp360"
                  >
                    {saveMutation.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {hasExistingReport ? "Update LGP360 Report" : "Save LGP360 Report"}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Your information is encrypted and will only be used to personalize your coaching experience.
                  </p>
                </CardContent>
              </Card>

            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}