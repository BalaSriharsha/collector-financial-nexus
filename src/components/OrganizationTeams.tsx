
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Building2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  group_members?: any[];
}

interface OrganizationTeamsProps {
  onCreateInvoice: () => void;
}

const OrganizationTeams = ({ onCreateInvoice }: OrganizationTeamsProps) => {
  const { user } = useAuth();

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

  // Categorize teams into departments (simplified logic for demo)
  const categorizeTeams = (teams: Group[]) => {
    const departments = {
      'Finance': teams.filter(team => team.name.toLowerCase().includes('finance') || team.name.toLowerCase().includes('accounting')),
      'Marketing': teams.filter(team => team.name.toLowerCase().includes('marketing') || team.name.toLowerCase().includes('sales')),
      'Operations': teams.filter(team => team.name.toLowerCase().includes('operations') || team.name.toLowerCase().includes('ops')),
      'General': teams.filter(team => 
        !team.name.toLowerCase().includes('finance') && 
        !team.name.toLowerCase().includes('accounting') &&
        !team.name.toLowerCase().includes('marketing') && 
        !team.name.toLowerCase().includes('sales') &&
        !team.name.toLowerCase().includes('operations') && 
        !team.name.toLowerCase().includes('ops')
      )
    };

    return Object.entries(departments).filter(([_, teams]) => teams.length > 0);
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
        <Button
          onClick={onCreateInvoice}
          className="bg-green-500 hover:bg-green-200 text-white hover:text-collector-black transition-all duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Invoice
        </Button>
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
                          <CardDescription className="mt-1">{team.description}</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Team
                        </Badge>
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
            className="bg-blue-500 hover:bg-blue-200 text-white hover:text-collector-black transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrganizationTeams;
