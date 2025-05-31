
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Users, Edit, Trash2 } from "lucide-react";
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
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ 
    name: "", 
    description: ""
  });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchGroups = async () => {
      setIsLoading(true);
      try {
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
        console.error("Error fetching groups:", error);
        toast.error(error.message || "Failed to fetch groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the groups list to get the updated data with the auto-added member
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

      setNewGroup({ name: "", description: "" });
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
      const { error } = await supabase
        .from('groups')
        .update({
          name: editingGroup.name,
          description: editingGroup.description,
        })
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
    <div className="min-h-screen bg-gradient-to-br from-collector-white via-orange-50 to-amber-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-collector-black mb-2">
              Groups
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

        {/* Groups List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-collector-black/70">Loading groups...</p>
            </div>
          ) : groups && groups.length > 0 ? (
            groups.map((group) => (
              <Card 
                key={group.id} 
                className="shadow-lg border-collector-gold/20 hover:shadow-xl transition-all duration-200"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => navigate(`/groups/${group.id}`)}>
                      <CardTitle className="text-collector-black">{group.name}</CardTitle>
                      <CardDescription className="mt-1">{group.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {group.created_by === user?.id && (
                        <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                          Owner
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(group)}
                        className="hover:bg-blue-200 transition-all duration-200"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-200 transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-collector-black/60">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{group.group_members?.length || 0} members</span>
                    </div>
                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Member avatars */}
                  {group.group_members && group.group_members.length > 0 && (
                    <div className="flex -space-x-2 mt-3">
                      {group.group_members.slice(0, 4).map((member: any, index: number) => (
                        <div 
                          key={member.id}
                          className="w-8 h-8 bg-blue-gradient rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                          title={member.profiles?.full_name || member.profiles?.email}
                        >
                          {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                        </div>
                      ))}
                      {group.group_members.length > 4 && (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
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
                Create a group to share expenses with friends or colleagues.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Roommates, Trip to Paris..."
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
                  placeholder="Brief description of the group..."
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
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Group Modal */}
        <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
          <DialogContent className="border-2 border-collector-gold/30">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Update group information.
              </DialogDescription>
            </DialogHeader>
            {editingGroup && (
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <Label htmlFor="editGroupName">Group Name *</Label>
                  <Input
                    id="editGroupName"
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="e.g., Roommates, Trip to Paris..."
                    required
                    className="border-2 border-collector-gold/30 focus:border-collector-orange"
                  />
                </div>
                <div>
                  <Label htmlFor="editGroupDescription">Description (Optional)</Label>
                  <Textarea
                    id="editGroupDescription"
                    value={editingGroup.description || ""}
                    onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Brief description of the group..."
                    className="border-2 border-collector-gold/30 focus:border-collector-orange"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditGroup(false)} 
                    className="flex-1 hover:bg-gray-200 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
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
