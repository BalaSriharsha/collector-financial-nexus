
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Users, Mail, Edit, Trash2, UserPlus, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const Groups = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's groups with proper error handling
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching groups for user:', user.id);
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(
            id,
            role,
            user_id,
            profiles(full_name, email)
          )
        `)
        .eq('group_members.user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }
      
      console.log('Groups data:', data);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch group invitations
  const { data: invitations } = useQuery({
    queryKey: ['group-invitations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('group_invitations')
        .select(`
          *,
          groups(name)
        `)
        .eq('invited_user_id', user.id)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const groupsChannel = supabase
      .channel('groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['groups'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_invitations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['group-invitations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
    };
  }, [user, queryClient]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          created_by: user.id,
        });

      if (error) throw error;

      toast.success('Group created successfully!');
      setNewGroup({ name: "", description: "" });
      setShowCreateGroup(false);
      // Real-time subscription will handle the update
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGroupId) return;

    setLoading(true);
    try {
      // First check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      const { error } = await supabase
        .from('group_invitations')
        .insert({
          group_id: selectedGroupId,
          invited_by: user.id,
          invited_user_id: existingUser?.id || null,
          invited_email: inviteEmail,
        });

      if (error) throw error;

      toast.success('Invitation sent successfully!');
      setInviteEmail("");
      setShowInviteModal(false);
      // Real-time subscription will handle the update
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string, groupId: string) => {
    if (!user) return;

    try {
      // Update invitation status
      const { error: inviteError } = await supabase
        .from('group_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (inviteError) throw inviteError;

      // Add user to group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) throw memberError;

      toast.success('Invitation accepted!');
      // Real-time subscription will handle the update
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Failed to accept invitation');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Group deleted successfully!');
      // Real-time subscription will handle the update
    } catch (error: any) {
      console.error('Error deleting group:', error);
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const handleExitGroup = async (groupId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to leave this group?')) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('You have left the group successfully!');
      // Real-time subscription will handle the update
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast.error(error.message || 'Failed to leave group');
    }
  };

  const isGroupCreator = (group: any) => group.created_by === user?.id;
  const canDeleteGroup = (group: any) => isGroupCreator(group);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-collector-black/70">Please log in to view your groups.</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Groups query error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600">Error loading groups: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-collector-black/70 hover:text-collector-orange transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-collector-black mb-2">
              My Groups
            </h1>
            <p className="text-collector-black/70">
              Manage your expense sharing groups
            </p>
          </div>
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Pending Invitations */}
        {invitations && invitations.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-700">Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium">{invitation.groups?.name}</p>
                      <p className="text-sm text-gray-600">Group invitation</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvitation(invitation.id, invitation.group_id)}
                        className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
                      >
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-gray-200 transition-all duration-200">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-collector-black/70">Loading groups...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} className="shadow-lg border-collector-gold/20 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedGroupId(group.id)}
                            className="hover:bg-blue-200 transition-all duration-200"
                          >
                            <UserPlus className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-2 border-collector-gold/30">
                          <DialogHeader>
                            <DialogTitle>Invite User</DialogTitle>
                            <DialogDescription>
                              Invite someone to join "{group.name}"
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleInviteUser} className="space-y-4">
                            <div>
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter email address"
                                required
                                className="border-2 border-collector-gold/30 focus:border-collector-orange"
                              />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200">
                              {loading ? 'Sending...' : 'Send Invitation'}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      {!isGroupCreator(group) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExitGroup(group.id)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-200 transition-all duration-200"
                        >
                          <LogOut className="w-3 h-3" />
                        </Button>
                      )}
                      {canDeleteGroup(group) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-collector-black/60" />
                    <span className="text-sm text-collector-black/60">
                      {group.group_members?.length || 0} members
                    </span>
                    {isGroupCreator(group) && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        Creator
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {group.group_members?.slice(0, 3).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <span className="text-sm">{member.profiles?.full_name || member.profiles?.email}</span>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                    {group.group_members && group.group_members.length > 3 && (
                      <p className="text-xs text-collector-black/60">
                        +{group.group_members.length - 3} more members
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-collector-black/70 mb-2">No groups yet</h3>
              <p className="text-collector-black/50 mb-4">Create your first group to start sharing expenses</p>
              <Button
                onClick={() => setShowCreateGroup(true)}
                className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent className="border-2 border-collector-gold/30">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group to share expenses with friends or colleagues
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Trip to Paris, Office Expenses..."
                  required
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What is this group for?"
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateGroup(false)}
                  className="flex-1 hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200">
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;
