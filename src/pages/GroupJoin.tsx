
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Calendar, Check, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface GroupInvitation {
  id: string;
  group_id: string;
  invited_by: string;
  invited_email: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  groups: {
    id: string;
    name: string;
    description: string | null;
    created_by: string;
  };
}

const GroupJoin = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [invitation, setInvitation] = useState<GroupInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('group_invitations')
          .select(`
            *,
            groups (
              id,
              name,
              description,
              created_by
            )
          `)
          .eq('id', invitationId)
          .single();

        if (error) throw error;

        if (!data) {
          setError("Invitation not found");
          setLoading(false);
          return;
        }

        // Check if invitation is expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This invitation has expired");
          setLoading(false);
          return;
        }

        // Check if invitation is already used
        if (data.status !== 'pending') {
          setError("This invitation has already been used");
          setLoading(false);
          return;
        }

        setInvitation(data);
      } catch (error: any) {
        console.error("Error fetching invitation:", error);
        setError("Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId]);

  const handleJoinGroup = async () => {
    if (!user || !invitation) {
      toast.error("Please log in to join the group");
      navigate('/auth');
      return;
    }

    setJoining(true);
    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast.error("You are already a member of this group");
        navigate(`/groups/${invitation.group_id}`);
        return;
      }

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: invitation.group_id,
          user_id: user.id,
          role: 'member'
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .update({ 
          status: 'accepted',
          invited_user_id: user.id
        })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      toast.success(`Successfully joined ${invitation.groups.name}!`);
      navigate(`/groups/${invitation.group_id}`);
    } catch (error: any) {
      console.error("Error joining group:", error);
      toast.error(error.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    try {
      const { error } = await supabase
        .from('group_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast.success("Invitation declined");
      navigate('/groups');
    } catch (error: any) {
      console.error("Error declining invitation:", error);
      toast.error("Failed to decline invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl text-red-600 dark:text-red-400">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/groups">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Groups
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border-collector-gold/20">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100">
            Join Group
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            You've been invited to join a group
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
              {invitation.groups.name}
            </h3>
            {invitation.groups.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {invitation.groups.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>
              Invited on {new Date(invitation.created_at).toLocaleDateString()}
            </span>
          </div>

          {invitation.expires_at && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Expires on {new Date(invitation.expires_at).toLocaleDateString()}
              </Badge>
            </div>
          )}

          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                Please log in to join this group
              </p>
              <Link to="/auth">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Log In to Join
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleJoinGroup}
                disabled={joining}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
              >
                {joining ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Join Group
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDeclineInvitation}
                variant="outline"
                className="w-full text-sm sm:text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link 
              to="/groups" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all groups
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupJoin;
