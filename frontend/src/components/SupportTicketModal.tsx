/**
 * SupportTicketModal - Modal for creating support tickets from milestone help requests
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/utils/authStore';
import { API_ENDPOINTS } from '@/config/api';

interface SupportTicketModalProps {
  open: boolean;
  onClose: () => void;
  milestoneNumber?: number;
  milestoneName?: string;
  prefilledSubject?: string;
  prefilledDescription?: string;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  open,
  onClose,
  milestoneNumber,
  milestoneName,
  prefilledSubject = '',
  prefilledDescription = '',
}) => {
  const { user, profile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: prefilledSubject || (milestoneNumber ? `Help with Milestone ${milestoneNumber}` : ''),
    description: prefilledDescription,
    category: 'milestone_help' as string,
    priority: 'medium' as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please log in to submit a support ticket');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please describe your issue');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.createSupportTicket, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userName: profile?.name || user.email?.split('@')[0] || 'User',
          userEmail: user.email,
          milestoneNumber: milestoneNumber,
          milestoneName: milestoneName,
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to submit support ticket');
      }

      const result = await response.json();

      toast.success('Support Ticket Submitted!', {
        description: `Ticket ID: ${result.ticketId}. We'll get back to you within 24-48 hours.`,
      });

      // Reset form
      setFormData({
        subject: '',
        description: '',
        category: 'milestone_help',
        priority: 'medium',
      });

      onClose();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('Failed to submit ticket', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="h-6 w-6 text-blue-600" />
            Get Help
          </DialogTitle>
          <DialogDescription className="text-base">
            {milestoneNumber ? (
              <>
                Submit a support ticket for <strong>Milestone {milestoneNumber}: {milestoneName}</strong>.
                Our team will get back to you within 24-48 hours.
              </>
            ) : (
              'Submit a support ticket and our team will get back to you within 24-48 hours.'
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-base font-semibold">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue"
              required
              maxLength={200}
              className="text-base"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-base font-semibold">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milestone_help">Milestone Help</SelectItem>
                <SelectItem value="technical_issue">Technical Issue</SelectItem>
                <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-base font-semibold">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - General question</SelectItem>
                <SelectItem value="medium">Medium - Need help</SelectItem>
                <SelectItem value="high">High - Blocking issue</SelectItem>
                <SelectItem value="urgent">Urgent - Critical problem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Describe your issue <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe your issue in detail. Include any error messages, steps you've taken, or questions you have."
              required
              rows={6}
              maxLength={2000}
              className="text-base resize-none"
            />
            <p className="text-sm text-gray-500">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>You'll receive a confirmation email with your ticket ID</li>
                  <li>Our support team will review your ticket within 24 hours</li>
                  <li>We'll email you when we have updates or a solution</li>
                  <li>You can check your ticket status in your Profile page</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.subject.trim() || !formData.description.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
