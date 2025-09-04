import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { lgp360ReportSchema, type LGP360ReportData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { BackButton } from "@/components/back-button";
import { FileText, Save, CheckCircle2, Upload, FileCheck, Loader2, Eye, EyeOff } from "lucide-react";

export default function LGP360ReportPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  // Fetch existing LGP360 data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/me"]
  });

  const userDataTyped = userData as { user?: { 
    lgp360ProfessionalReport?: string; 
    lgp360Assessment?: string;
    lgp360OriginalContent?: string;
    lgp360UploadedAt?: string; 
  } } | undefined;
  
  const hasExistingReport = !!userDataTyped?.user?.lgp360ProfessionalReport;

  const form = useForm<LGP360ReportData>({
    resolver: zodResolver(lgp360ReportSchema),
    defaultValues: {
      originalContent: userDataTyped?.user?.lgp360OriginalContent || "",
      assessment: userDataTyped?.user?.lgp360Assessment || "",
      professionalReport: userDataTyped?.user?.lgp360ProfessionalReport || "",
    },
  });

  const watchedReport = form.watch("professionalReport");
  const watchedAssessment = form.watch("assessment");

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
    onSuccess: (data: { originalContent: string; assessment: string; professionalReport: string }) => {
      // Auto-populate form with AI-generated data
      form.setValue("originalContent", data.originalContent);
      form.setValue("assessment", data.assessment);
      form.setValue("professionalReport", data.professionalReport);
      toast({
        title: "Document Analysis Complete",
        description: "AI has created both a coaching assessment and professional report. Review and save when ready.",
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

  const onSubmit = (data: LGP360ReportData) => {
    saveMutation.mutate(data);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
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
                  ? "Upload a new document or edit your leadership profile to ensure the AI coach provides the most personalized guidance."
                  : "Upload your leadership assessment document and let AI create a comprehensive analysis with both coaching assessment and professional report."
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
                Enhanced Document Analysis
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-300">
                Upload your LGP360 report, 360-degree feedback, or leadership assessment. AI will create both a coaching assessment for development planning and a professional report for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isProcessingUpload ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">
                          AI is creating comprehensive analysis...
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          Generating coaching assessment and professional report
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <FileCheck className="h-12 w-12 text-blue-500" />
                      <div>
                        <p className="text-lg font-medium text-blue-700 dark:text-blue-300">
                          Click to upload your leadership document
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
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

          {/* Professional Report */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Leadership Report</CardTitle>
                  <CardDescription>
                    {watchedReport 
                      ? "Review your professional leadership report and save when ready."
                      : "Upload a document above to generate your professional leadership report."
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {watchedReport && (
                    <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-semibold text-lg mb-4">Your Professional Report</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {watchedReport}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="professionalReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Report</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Your professional leadership report will appear here after document upload..."
                            className="min-h-[200px] resize-y"
                            {...field}
                            data-testid="textarea-professional-report"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Coaching Assessment (Expandable) */}
              {watchedAssessment && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Coaching Assessment</CardTitle>
                        <CardDescription>
                          Detailed coaching analysis for development planning
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAssessment(!showAssessment)}
                      >
                        {showAssessment ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            View Assessment
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showAssessment && (
                    <CardContent>
                      <div className="border rounded-lg p-6 bg-amber-50 dark:bg-amber-950/20">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {watchedAssessment}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending || !watchedReport}
                  className="flex-1"
                  data-testid="button-save-report"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Leadership Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}