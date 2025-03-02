'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember } from '@/app/(login)/actions';
import { InviteTeamMember } from './invite-team';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Users, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Star, 
  Diamond,
  Trash2,
  Crown,
  ShieldCheck
} from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, { error: '', success: '' });

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  const getSubscriptionStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      active: { 
        icon: Check, 
        color: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-none', 
        label: 'Active' 
      },
      trialing: { 
        icon: Sparkles, 
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-none', 
        label: 'Trial' 
      },
      canceled: { 
        icon: Diamond, 
        color: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-none', 
        label: 'Canceled' 
      },
      incomplete: { 
        icon: Star, 
        color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none', 
        label: 'Incomplete' 
      },
      past_due: { 
        icon: CreditCard, 
        color: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-none', 
        label: 'Past Due' 
      }
    };
    
    const config = statusConfig[status] || { 
      icon: Diamond, 
      color: 'bg-gradient-to-r from-slate-500 to-slate-600 text-white border-none', 
      label: status 
    };
    
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`ml-2 ${config.color} shadow-sm`}>
        <Icon className="h-3 w-3 mr-1" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Team Settings
          </h1>
          <p className="text-slate-500">Manage your team, subscription, and account settings</p>
        </div>
        <Button className="mt-4 lg:mt-0 relative overflow-hidden group bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-xl px-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300">
          <span className="relative z-10">Save Changes</span>
          <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 bg-gradient-to-r from-orange-600 to-amber-600 transition-transform duration-300 ease-in-out"></div>
        </Button>
      </div>
      
      <Card className="overflow-hidden border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white relative">
        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-bl-3xl blur-xl"></div>
        <CardHeader className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-100 px-8 py-6 relative z-10">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-xl font-bold text-slate-900">Subscription</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">Manage your plan and billing</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="bg-slate-50 px-6 py-5 rounded-xl border border-slate-100 shadow-sm w-full lg:w-2/3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                  {teamData.planName === 'Pro' ? (
                    <Crown className="h-8 w-8 text-white" />
                  ) : teamData.planName === 'Business' ? (
                    <ShieldCheck className="h-8 w-8 text-white" />
                  ) : (
                    <Star className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-slate-900">
                      {teamData.planName || 'Free Plan'}
                    </h3>
                    {getSubscriptionStatusBadge(teamData.subscriptionStatus)}
                  </div>
                  <p className="text-slate-500 mt-1">
                    {teamData.subscriptionStatus === 'active'
                      ? 'Billed monthly · Renews on the 1st'
                      : teamData.subscriptionStatus === 'trialing'
                        ? 'Trial ends in 14 days'
                        : 'No active subscription'}
                  </p>
                </div>
              </div>
            </div>
            <form action={customerPortalAction} className="w-full lg:w-auto">
              <Button 
                type="submit" 
                variant="outline"
                className="w-full lg:w-auto border-slate-200 bg-white/80 hover:bg-white shadow-sm hover:shadow text-slate-800 rounded-xl px-5 py-2.5 h-auto font-medium hover:border-orange-200 hover:text-orange-600 transition-all duration-200"
              >
                Manage Subscription
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white relative">
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-gradient-to-tr from-blue-500/10 to-violet-500/10 rounded-tr-3xl blur-xl"></div>
        <CardHeader className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-100 px-8 py-6 relative z-10">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-xl font-bold text-slate-900">Team Members</CardTitle>
              <p className="text-sm text-slate-500 mt-0.5">Manage your team and permissions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          <ul className="divide-y divide-slate-100">
            {teamData.teamMembers.map((member, index) => (
              <li key={member.id} className="hover:bg-slate-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-8 gap-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 rounded-xl border-4 border-white shadow-md">
                      <AvatarImage
                        src={`/placeholder.svg?height=48&width=48`}
                        alt={getUserDisplayName(member.user)}
                      />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-lg">
                        {getUserDisplayName(member.user)
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900">
                        {getUserDisplayName(member.user)}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-16 sm:ml-0">
                    <Badge 
                      variant="outline" 
                      className={`${
                        member.role === 'owner' 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0' 
                          : 'border border-slate-200 bg-white text-slate-700'
                      } shadow-sm px-3 py-1 rounded-lg capitalize`}
                    >
                      {member.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                      {member.role}
                    </Badge>
                    {index > 1 ? (
                      <form action={removeAction}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors rounded-lg"
                          disabled={isRemovePending}
                        >
                          {isRemovePending ? (
                            'Removing...'
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </>
                          )}
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {removeState?.error && (
            <div className="bg-red-50 m-8 rounded-lg border border-red-100 p-4 text-red-600">
              {removeState.error}
            </div>
          )}
        </CardContent>
      </Card>
      
      <InviteTeamMember />
    </section>
  );
}
