'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Loader2, 
  PlusCircle, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Shield, 
  User, 
  Lock,
  ChevronRight 
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { use, useActionState, useEffect, useState } from 'react';
import { inviteTeamMember } from '@/app/(login)/actions';
import { useUser } from '@/lib/auth';

type ActionState = {
  error?: string;
  success?: string;
};

export function InviteTeamMember() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, { error: '', success: '' });
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('member');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="overflow-hidden border-0 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-white relative">
      <div className="absolute bottom-0 right-0 h-40 w-48 bg-gradient-to-bl from-purple-500/10 to-indigo-500/10 rounded-tl-[100px] blur-xl"></div>
      <div className="absolute top-0 left-0 h-16 w-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-br-[50px] blur-md"></div>
      
      <CardHeader className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-100 px-8 py-6 relative z-10">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div className="ml-4">
            <CardTitle className="text-xl font-bold text-slate-900">Invite Team Member</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">Add new members to your team</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 relative z-10">
        <form action={inviteAction} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-2xl blur-lg transform group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
            <div className="relative bg-white group border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-md">
              <Label 
                htmlFor="email" 
                className="text-slate-700 font-medium mb-1.5 block flex items-center"
              >
                <Mail className="h-4 w-4 mr-2 text-slate-400" />
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@example.com"
                  required
                  disabled={!isOwner}
                  className="h-12 pl-4 pr-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-md">
              <Label 
                className="text-slate-700 font-medium mb-3 block flex items-center"
              >
                <Shield className="h-4 w-4 mr-2 text-slate-400" />
                Team Role
              </Label>
              <RadioGroup
                defaultValue="member"
                name="role"
                className="flex flex-col sm:flex-row gap-4"
                disabled={!isOwner}
                onValueChange={setSelectedRole}
                value={selectedRole}
              >
                <div 
                  className={`flex-1 cursor-pointer border ${
                    selectedRole === 'member' 
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white'
                  } rounded-xl p-4 transition-all duration-200 hover:border-indigo-200 relative`}
                  onClick={() => isOwner && setSelectedRole('member')}
                >
                  <div className="absolute top-4 right-4">
                    <RadioGroupItem 
                      value="member" 
                      id="member" 
                      className="border-indigo-300 text-indigo-600" 
                    />
                  </div>
                  <div className="mt-1 mb-2 flex justify-center">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Label htmlFor="member" className="text-slate-900 font-medium block mb-1">Member</Label>
                    <p className="text-xs text-slate-500">Standard access to team resources</p>
                  </div>
                </div>
                
                <div 
                  className={`flex-1 cursor-pointer border ${
                    selectedRole === 'owner' 
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white'
                  } rounded-xl p-4 transition-all duration-200 hover:border-indigo-200 relative`}
                  onClick={() => isOwner && setSelectedRole('owner')}
                >
                  <div className="absolute top-4 right-4">
                    <RadioGroupItem 
                      value="owner" 
                      id="owner" 
                      className="border-indigo-300 text-indigo-600" 
                    />
                  </div>
                  <div className="mt-1 mb-2 flex justify-center">
                    <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Label htmlFor="owner" className="text-slate-900 font-medium block mb-1">Owner</Label>
                    <p className="text-xs text-slate-500">Full administrative privileges</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {inviteState?.error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start animate-in slide-in-from-top duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{inviteState.error}</p>
            </div>
          )}
          
          {inviteState?.success && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-emerald-700">{inviteState.success}</p>
            </div>
          )}
          
          <div>
            <Button
              type="submit"
              disabled={isInvitePending || !isOwner}
              className={`${
                mounted ? 'transition-all duration-300' : ''
              } w-full sm:w-auto relative overflow-hidden group bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium rounded-xl px-6 py-3 h-auto shadow-lg hover:shadow-xl`}
            >
              <span className="relative z-10 flex items-center">
                {isInvitePending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Invitation...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Invite Team Member
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 -translate-y-full group-hover:translate-y-0 bg-gradient-to-r from-indigo-600 to-violet-700 transition-transform duration-300 ease-in-out"></div>
            </Button>
          </div>
        </form>
      </CardContent>
      
      {!isOwner && (
        <CardFooter className="bg-amber-50 border-t border-amber-200 px-8 py-5 relative z-10">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mr-4">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-800">
                Permission Required
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                You need owner permissions to invite new team members
              </p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
