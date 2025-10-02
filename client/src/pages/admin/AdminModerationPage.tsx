/**
 * Admin Content Moderation Dashboard
 * Apple Store requirement: timely response to reports
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Flag,
  MessageSquare,
  Users,
  Eye
} from 'lucide-react';

interface ContentReport {
  id: number;
  contentType: string;
  contentId: number;
  reason: string;
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: number;
    username: string;
    displayName?: string;
  };
  content?: {
    id: number;
    content: string;
    authorId: number;
    author: {
      username: string;
      displayName?: string;
    };
  };
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/moderation/admin/reports?status=${filter}&limit=50`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: number, status: 'resolved' | 'dismissed') => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/moderation/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes: reviewNotes.trim() || undefined
        }),
        credentials: 'include'
      });

      if (response.ok) {
        await fetchReports();
        setSelectedReport(null);
        setReviewNotes('');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'dismissed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      harassment: 'Harassment',
      inappropriate: 'Inappropriate',
      hate_speech: 'Hate Speech',
      false_info: 'False Information',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Moderation</h1>
        <p className="text-muted-foreground">
          Review and manage reported content to maintain community standards.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Reports</SelectItem>
            <SelectItem value="resolved">Resolved Reports</SelectItem>
            <SelectItem value="dismissed">Dismissed Reports</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {filter} reports
            </h3>
            <p className="text-muted-foreground">
              {filter === 'pending' 
                ? "Great! There are no pending reports to review."
                : `No ${filter} reports found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            {reports.length} {filter} report{reports.length !== 1 ? 's' : ''}
          </div>

          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(report.status)}
                      <Badge variant={getStatusBadgeVariant(report.status) as any} className="capitalize">
                        {report.status}
                      </Badge>
                      <Badge variant="outline">
                        {getReasonLabel(report.reason)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {report.contentType}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium">Reported by:</span> {' '}
                        {report.reporter.displayName || report.reporter.username}
                      </div>
                      
                      {report.description && (
                        <div className="text-sm">
                          <span className="font-medium">Details:</span> {report.description}
                        </div>
                      )}

                      {report.content && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-xs text-gray-500 mb-1">
                            Content by {report.content.author.displayName || report.content.author.username}:
                          </div>
                          <p className="text-sm line-clamp-3">{report.content.content}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Reported {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Review Report #{selectedReport.id}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Take action on this content report
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Content Type:</span> {selectedReport.contentType}
                </div>
                <div>
                  <span className="font-medium">Reason:</span> {getReasonLabel(selectedReport.reason)}
                </div>
                <div>
                  <span className="font-medium">Reporter:</span> {selectedReport.reporter.displayName || selectedReport.reporter.username}
                </div>
                <div>
                  <span className="font-medium">Reported:</span> {new Date(selectedReport.createdAt).toLocaleString()}
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <span className="font-medium text-sm">Reporter's description:</span>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-gray-50 rounded border">
                    {selectedReport.description}
                  </p>
                </div>
              )}

              {selectedReport.content && (
                <div>
                  <span className="font-medium text-sm">Reported content:</span>
                  <div className="mt-1 p-3 bg-gray-50 rounded border">
                    <div className="text-xs text-gray-500 mb-2">
                      By {selectedReport.content.author.displayName || selectedReport.content.author.username}
                    </div>
                    <p className="text-sm">{selectedReport.content.content}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Review notes (optional)
                </label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReport(null);
                  setReviewNotes('');
                }}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleResolveReport(selectedReport.id, 'dismissed')}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Processing...' : 'Dismiss'}
              </Button>
              <Button
                onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Processing...' : 'Take Action'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}