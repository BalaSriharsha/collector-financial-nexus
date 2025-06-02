import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Users, Edit, Trash2, Crown, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Group {
  id: string;
  created_at: string;
  name: string;
  description: string;
  created_by: string;
  department_name?: string | null;
  team_name?: string | null;
  group_members?: any[];
}

const Groups = () => {
  const { user } = useAuth();
  const { subscription, canAccess } = useSubscription();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ 
    name: "", 
    description: "",
    department_name: "",
    team_name: ""
  });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile to check user type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        // Fetch groups
        const { data, error } = await supabase
          .from('groups')
          .select(`
            *,
            group_members(
              id,
              role,
              user_id,
              profiles(id, full_name, email)
            )
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGroups(data || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if user can access expense sharing
    if (!canAccess('expense-sharing')) {
      toast.error('Upgrade to Premium or Organization plan to create groups');
      return;
    }

    setLoading(true);
    try {
      const groupData: any = {
        name: newGroup.name,
        description: newGroup.description || null,
        created_by: user.id,
      };

      // Only add department and team if user is organization type
      if (userProfile?.user_type === 'organization') {
        groupData.department_name = newGroup.department_name || null;
        groupData.team_name = newGroup.team_name || null;
      }

      const { data: group, error } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      // Refresh the groups list
      const { data: updatedGroups, error: fetchError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            id,
            role,
            user_id,
            profiles(id, full_name, email)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGroups(updatedGroups || []);

      setNewGroup({ name: "", description: "", department_name: "", team_name: "" });
      setShowCreateGroup(false);
      toast.success('Group created successfully!');
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !user) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: editingGroup.name,
        description: editingGroup.description,
      };

      // Only update department and team if user is organization type
      if (userProfile?.user_type === 'organization') {
        updateData.department_name = editingGroup.department_name;
        updateData.team_name = editingGroup.team_name;
      }

      const { error } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', editingGroup.id);

      if (error) throw error;

      // Refresh the groups list
      const { data: updatedGroups, error: fetchError } = await supabase
        .from('groups')
        .select(`
          *,
          group_members(
            id,
            role,
            user_id,
            profiles(id, full_name, email)
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setGroups(updatedGroups || []);

      toast.success('Group updated successfully!');
      setShowEditGroup(false);
      setEditingGroup(null);
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error(error.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
      toast.success('Group deleted successfully!');
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete group");
    }
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup({ ...group });
    setShowEditGroup(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-slate-800 dark:text-slate-100">
              Groups
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Manage your expense sharing groups
            </p>
          </div>
          <Button
            onClick={() => setShowCreateGroup(true)}
            disabled={!canAccess('expense-sharing')}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 text-sm sm:text-base"
          >
            {!canAccess('expense-sharing') ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Upgrade Required
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </>
            )}
          </Button>
        </div>

        {!canAccess('expense-sharing') && (
          <Alert className="mb-6 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
            <Crown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-900 dark:text-orange-300 font-medium">
              Upgrade to Premium or Organization plan to create and manage groups for expense sharing.
            </AlertDescription>
          </Alert>
        )}

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading groups...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            groups.map((group) => (
              <Card 
                key={group.id} 
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 cursor-pointer min-w-0" onClick={() => navigate(`/groups/${group.id}`)}>
                      <CardTitle className="text-base sm:text-lg text-slate-800 dark:text-slate-100 truncate">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="mt-1 text-sm line-clamp-2 text-slate-600 dark:text-slate-400">{group.description}</CardDescription>
                      )}
                      {userProfile?.user_type === 'organization' && (group.department_name || group.team_name) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.department_name && (
                            <Badge variant="secondary" className="text-xs dark:bg-slate-700 dark:text-slate-200">{group.department_name}</Badge>
                          )}
                          {group.team_name && (
                            <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">{group.team_name}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-700">
                        Owner
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(group)}
                          className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-slate-600"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteGroup(group.id, group.name)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{group.group_members?.length || 0} members</span>
                    </div>
                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Member avatars */}
                  {group.group_members && group.group_members.length > 0 && (
                    <div className="flex -space-x-1">
                      {group.group_members.slice(0, 4).map((member: any, index: number) => (
                        <div 
                          key={member.id}
                          className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-slate-800"
                          title={member.profiles?.full_name || member.profiles?.email}
                        >
                          {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                        </div>
                      ))}
                      {group.group_members.length > 4 && (
                        <div className="w-6 h-6 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-slate-800">
                          +{group.group_members.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 sm:w-16 h-12 sm:h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No groups yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                {canAccess('expense-sharing') 
                  ? 'Create your first group to start sharing expenses'
                  : 'Upgrade to Premium to create groups'
                }
              </p>
              {canAccess('expense-sharing') && (
                <Button
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a group to share expenses with friends or colleagues.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="groupName" className="text-sm">Group Name *</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Roommates, Trip to Paris..."
                  required
                  className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription" className="text-sm">Description (Optional)</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the group..."
                  className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                  rows={3}
                />
              </div>
              
              {/* Show department/team fields only for organization users */}
              {userProfile?.user_type === 'organization' && (
                <>
                  <div>
                    <Label htmlFor="departmentName" className="text-sm">Department (Optional)</Label>
                    <Input
                      id="departmentName"
                      value={newGroup.department_name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, department_name: e.target.value }))}
                      placeholder="e.g., Engineering, Marketing..."
                      className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamName" className="text-sm">Team (Optional)</Label>
                    <Input
                      id="teamName"
                      value={newGroup.team_name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, team_name: e.target.value }))}
                      placeholder="e.g., Frontend, Sales Team..."
                      className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                    />
                  </div>
                </>
              )}
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateGroup(false)} 
                  className="flex-1 hover:bg-gray-50 text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Group Modal */}
        <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
          <DialogContent className="border-2 border-collector-gold/30 max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Update group information.
              </DialogDescription>
            </DialogHeader>
            {editingGroup && (
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="editGroupName" className="text-sm">Group Name *</Label>
                  <Input
                    id="editGroupName"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="e.g., Roommates, Trip to Paris..."
                    required
                    className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="editGroupDescription" className="text-sm">Description (Optional)</Label>
                  <Textarea
                    id="editGroupDescription"
                    value={editingGroup.description || ""}
                    onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Brief description of the group..."
                    className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                    rows={3}
                  />
                </div>
                
                {/* Show department/team fields only for organization users */}
                {userProfile?.user_type === 'organization' && (
                  <>
                    <div>
                      <Label htmlFor="editDepartmentName" className="text-sm">Department (Optional)</Label>
                      <Input
                        id="editDepartmentName"
                        value={editingGroup.department_name || ""}
                        onChange={(e) => setEditingGroup(prev => prev ? { ...prev, department_name: e.target.value } : null)}
                        placeholder="e.g., Engineering, Marketing..."
                        className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="editTeamName" className="text-sm">Team (Optional)</Label>
                      <Input
                        id="editTeamName"
                        value={editingGroup.team_name || ""}
                        onChange={(e) => setEditingGroup(prev => prev ? { ...prev, team_name: e.target.value } : null)}
                        placeholder="e.g., Frontend, Sales Team..."
                        className="border-2 border-collector-gold/30 focus:border-collector-orange text-sm"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditGroup(false)} 
                    className="flex-1 hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm"
                  >
                    {loading ? 'Updating...' : 'Update Group'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Groups;
