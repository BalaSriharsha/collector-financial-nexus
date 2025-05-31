
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GroupMember {
  id: string;
  role: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

interface GroupMembersProps {
  members: GroupMember[];
}

const GroupMembers = ({ members }: GroupMembersProps) => {
  return (
    <Card className="shadow-lg border-collector-gold/20">
      <CardHeader>
        <CardTitle>Group Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-gradient rounded-full flex items-center justify-center text-white font-medium mr-3">
                  {member.profiles?.full_name?.[0] || member.profiles?.email?.[0]}
                </div>
                <div>
                  <p className="font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                  <p className="text-sm text-gray-600">{member.profiles?.email}</p>
                </div>
              </div>
              <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupMembers;
