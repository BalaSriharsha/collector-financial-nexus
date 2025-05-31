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
import { Plus, Users } from "lucide-react";
import Navigation from "@/components/Navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Group {
  id: string;
  created_at: string;
  name: string;
  description: string;
  created_by: string;
  group_members?: any[];
}

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [showCreateGroup, setShowCreateGroup] = useState(false);
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
          description: newGroup.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add the creator to the group_members table with 'admin' role
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      setGroups(prevGroups => [...prevGroups, { ...group, group_members: [{ user_id: user.id, role: 'admin', profiles: user.user_metadata }] }]);
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
                className="shadow-lg border-collector-gold/20 hover:shadow-xl transition-all duration-200 cursor-pointer hover:transform hover:-translate-y-1"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-collector-black">{group.name}</CardTitle>
                      <CardDescription className="mt-1">{group.description}</CardDescription>
                    </div>
                    {group.created_by === user?.id && (
                      <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                        Owner
                      </Badge>
                    )}
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
                Create a group to share expenses with friends or colleagues
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
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
      </div>
    </div>
  );
};

export default Groups;
