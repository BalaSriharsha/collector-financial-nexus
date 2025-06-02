
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Share2, Mail, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GroupInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

const GroupInviteModal = ({ isOpen, onClose, groupId, groupName }: GroupInviteModalProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [showInviteLink, setShowInviteLink] = useState(false);

  const generateInviteLink = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: invitation, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/groups/join/${invitation.id}`;
      setInviteLink(link);
      setShowInviteLink(true);
      toast.success('Invitation link generated!');
    } catch (error: any) {
      console.error("Error generating invite link:", error);
      toast.error(error.message || "Failed to generate invitation link");
    } finally {
      setLoading(false);
    }
  };

  const sendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email) return;

    setLoading(true);
    try {
      const { data: invitation, error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: groupId,
          invited_by: user.id,
          invited_email: email,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/groups/join/${invitation.id}`;
      
      // Create a mailto link for now (in a real app, you'd send actual emails)
      const subject = `Invitation to join ${groupName}`;
      const body = `You've been invited to join the group "${groupName}". Click this link to join: ${link}`;
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.open(mailtoLink);
      
      setEmail("");
      toast.success('Email invitation created! Please send the email.');
    } catch (error: any) {
      console.error("Error sending email invite:", error);
      toast.error(error.message || "Failed to send email invitation");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName}`,
          text: `You've been invited to join the group "${groupName}"`,
          url: inviteLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 max-w-md mx-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Invite to {groupName}</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Share an invitation link or send an email invite to add members to your group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Generate Link Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Share Invitation Link
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Generate a link that anyone can use to join the group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showInviteLink ? (
                <Button
                  onClick={generateInviteLink}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
                >
                  {loading ? 'Generating...' : 'Generate Invite Link'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 break-all">
                      {inviteLink}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={shareLink}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Invite Section */}
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                Send Email Invitation
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Send a direct invitation to a specific email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendEmailInvite} className="space-y-3">
                <div>
                  <Label htmlFor="inviteEmail" className="text-sm">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    required
                    className="border-2 border-slate-300 dark:border-slate-600 focus:border-blue-500 text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                >
                  {loading ? 'Sending...' : 'Send Email Invitation'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 text-sm sm:text-base"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupInviteModal;
