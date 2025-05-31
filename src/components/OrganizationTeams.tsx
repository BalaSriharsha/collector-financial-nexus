
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Building2, FileText, Edit, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  department_name?: string | null;
  team_name?: string | null;
  group_members?: any[];
}

interface OrganizationTeamsProps {
  onCreateInvoice: () => void;
}

const OrganizationTeams = ({ onCreateInvoice }: OrganizationTeamsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    department_name: "",
    team_name: "",
  });

  // Fetch groups for the organization view
  const { data: teams, isLoading } = useQuery({
    queryKey: ['organization-teams', user?.id],
    queryFn: async (): Promise<Group[]> => {
      if (!user) return [];
      
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
      return data || [];
    },
    enabled: !!user,
  });

  // Categorize teams into departments
  const categorizeTeams = (teams: Group[]) => {
    const departments: { [key: string]: Group[] } = {};

    teams.forEach(team => {
      const departmentName = team.department_name || 'General';
      if (!departments[departmentName]) {
        departments[departmentName] = [];
      }
      departments[departmentName].push(team);
    });

    return Object.entries(departments).filter(([_, teams]) => teams.length > 0);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description || null,
          department_name: newGroup.department_name || null,
          team_name: newGroup.team_name || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast.success('Team created successfully!');
      setNewGroup({ name: "", description: "", department_name: "", team_name: "" });
      setShowCreateGroup(false);
      queryClient.invalidateQueries({ queryKey: ['organization-teams'] });
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create team");
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
          department_name: editingGroup.department_name,
          team_name: editingGroup.team_name,
        })
        .eq('id', editingGroup.id);

      if (error) throw error;

      toast.success('Team updated successfully!');
      setShowEditGroup(false);
      setEditingGroup(null);
      queryClient.invalidateQueries({ queryKey: ['organization-teams'] });
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error(error.message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the team "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Team deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['organization-teams'] });
    } catch (error: any) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete team");
    }
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup({
      ...group,
      department_name: group.department_name || "",
      team_name: group.team_name || "",
    });
    setShowEditGroup(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-collector-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-collector-black/70">Loading teams and departments...</p>
      </div>
    );
  }

  const departmentData = teams ? categorizeTeams(teams) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-collector-black">Teams & Departments</h2>
          <p className="text-collector-black/70">Manage your organizational structure and generate invoices</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
          <Button
            onClick={onCreateInvoice}
            className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {departmentData.length > 0 ? (
        <div className="space-y-8">
          {departmentData.map(([departmentName, departmentTeams]) => (
            <div key={departmentName}>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-5 h-5 text-collector-orange" />
                <h3 className="text-xl font-playfair font-semibold text-collector-black">
                  {departmentName} Department
                </h3>
                <Badge variant="outline" className="text-xs">
                  {departmentTeams.length} teams
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentTeams.map((team) => (
                  <Card key={team.id} className="shadow-lg border-collector-gold/20 hover:shadow-xl transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-collector-black flex items-center gap-2">
                            <Users className="w-4 h-4 text-collector-orange" />
                            {team.name}
                          </CardTitle>
                          {team.team_name && (
                            <p className="text-sm text-collector-black/60 mt-1">Team: {team.team_name}</p>
                          )}
                          <CardDescription className="mt-1">{team.description}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(team)}
                            className="hover:bg-blue-200 transition-all duration-200"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGroup(team.id, team.name)}
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
                          <span>{team.group_members?.length || 0} members</span>
                        </div>
                        <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Member avatars */}
                      {team.group_members && team.group_members.length > 0 && (
                        <div className="flex -space-x-2 mt-3">
                          {team.group_members.slice(0, 4).map((member: any, index: number) => (
                            <div 
                              key={member.id}
                              className="w-8 h-8 bg-blue-gradient rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                              title={member.profiles?.full_name || member.profiles?.email}
                            >
                              {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                            </div>
                          ))}
                          {team.group_members.length > 4 && (
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                              +{team.group_members.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-collector-black/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-collector-black/70 mb-2">No teams yet</h3>
          <p className="text-collector-black/50 mb-4">Create teams and departments to organize your organization</p>
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}

      {/* Create Group Modal */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="border-2 border-collector-gold/30">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a team for your organization. Department and team names are optional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <Label htmlFor="groupName">Team Name *</Label>
              <Input
                id="groupName"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Marketing Team, Finance Team..."
                required
                className="border-2 border-collector-gold/30 focus:border-collector-orange"
              />
            </div>
            <div>
              <Label htmlFor="departmentName">Department Name (Optional)</Label>
              <Input
                id="departmentName"
                value={newGroup.department_name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, department_name: e.target.value }))}
                placeholder="e.g., Marketing, Finance, Operations..."
                className="border-2 border-collector-gold/30 focus:border-collector-orange"
              />
            </div>
            <div>
              <Label htmlFor="teamName">Team Name (Optional)</Label>
              <Input
                id="teamName"
                value={newGroup.team_name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, team_name: e.target.value }))}
                placeholder="e.g., Alpha Team, Digital Marketing..."
                className="border-2 border-collector-gold/30 focus:border-collector-orange"
              />
            </div>
            <div>
              <Label htmlFor="groupDescription">Description (Optional)</Label>
              <Textarea
                id="groupDescription"
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the team..."
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
                {loading ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="border-2 border-collector-gold/30">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information. Department and team names are optional.
            </DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <Label htmlFor="editGroupName">Team Name *</Label>
                <Input
                  id="editGroupName"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="e.g., Marketing Team, Finance Team..."
                  required
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div>
                <Label htmlFor="editDepartmentName">Department Name (Optional)</Label>
                <Input
                  id="editDepartmentName"
                  value={editingGroup.department_name || ""}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, department_name: e.target.value } : null)}
                  placeholder="e.g., Marketing, Finance, Operations..."
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div>
                <Label htmlFor="editTeamName">Team Name (Optional)</Label>
                <Input
                  id="editTeamName"
                  value={editingGroup.team_name || ""}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, team_name: e.target.value } : null)}
                  placeholder="e.g., Alpha Team, Digital Marketing..."
                  className="border-2 border-collector-gold/30 focus:border-collector-orange"
                />
              </div>
              <div>
                <Label htmlFor="editGroupDescription">Description (Optional)</Label>
                <Textarea
                  id="editGroupDescription"
                  value={editingGroup.description || ""}
                  onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Brief description of the team..."
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
                  {loading ? 'Updating...' : 'Update Team'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationTeams;
