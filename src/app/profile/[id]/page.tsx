'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Shield, UserPlus, UserCheck, Inbox } from 'lucide-react';
import Image from 'next/image';

interface ProfileData {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  trustScore: number;
  location: string | null;
  totalTransactions: number;
}

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export default function PublicProfilePage() {
  const params = useParams() as { id: string };
  const { user } = useAppStore();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<FollowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [profRes, statRes] = await Promise.all([
          fetch(`/api/listings?sellerId=${params.id}`).then(r => r.json()), // Leverage existing listings route to extract seller metadata globally safely
          fetch(`/api/users/${params.id}/follow?followerId=${user?.id || ''}`).then(r => r.json())
        ]);
        
        // Very basic extraction since API lists cards, we can steal the seller object from the first card optionally, OR just assume this route was properly built if backend is upgraded.
        // Actually, we use `/api/users/search` directly to get basic data!
        const searchRes = await fetch(`/api/users/search?q=`); 
        // We will natively fetch from a reliable location. Let's just hydrate using follow route data for now and basic fallbacks!
      } catch (e) {
        console.error(e);
      }
    }
    
    // Natively fetch profile payload
    fetch(`/api/users/search?q=${params.id}`)
       .then(r => r.json())
       .then(data => {
          if (data.users?.[0]) {
             setProfile(data.users[0]);
          }
       });

    fetch(`/api/users/${params.id}/follow${user ? `?followerId=${user.id}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, [params.id, user]);

  const toggleFollow = async () => {
    if (!user) return router.push('/auth/login');
    if (actionLoading || !stats) return;
    
    setActionLoading(true);
    try {
      const isCurrentlyFollowing = stats.isFollowing;
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      
      const res = await fetch(`/api/users/${params.id}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id })
      });
      
      if (res.ok) {
        setStats({
          ...stats,
          followersCount: stats.followersCount + (isCurrentlyFollowing ? -1 : 1),
          isFollowing: !isCurrentlyFollowing
        });
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex py-20 justify-center"><div className="animate-spin w-6 h-6 border-b-2 border-blue-600 rounded-full" /></div>;
  if (!profile && !stats) return <div className="p-8 text-center text-gray-500">Profile not found.</div>;

  const isOwnProfile = user?.id === params.id;

  return (
    <div className="bg-slate-50 min-h-screen">
       <div className="bg-white px-4 py-8 border-b border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 relative overflow-hidden ring-4 ring-offset-2 ring-gray-50">
             {profile?.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="" fill className="object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl bg-gradient-to-br from-gray-100 to-gray-200 uppercase">
                   {profile?.displayName?.[0] || '?'}
                </div>
             )}
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1.5 justify-center">
             {profile?.displayName || 'CardVault Member'}
             {profile?.trustScore !== undefined && profile.trustScore >= 4.5 ? <Shield size={14} className="fill-blue-600 text-blue-600" /> : null}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1 font-medium flex items-center justify-center gap-1">
             Community Rating: <span className="font-bold text-gray-800">{profile?.trustScore?.toFixed(1) ?? '5.0'} ★</span>
          </p>
          
          <div className="flex items-center gap-6 mt-6">
             <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{stats?.followersCount || 0}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Followers</p>
             </div>
             <div className="h-8 w-px bg-gray-200"></div>
             <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{stats?.followingCount || 0}</p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Following</p>
             </div>
          </div>
          
          {!isOwnProfile && (
             <div className="flex gap-3 mt-8 w-full">
                <button 
                  onClick={toggleFollow}
                  disabled={actionLoading}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    stats?.isFollowing 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700'
                  }`}
                >
                  {stats?.isFollowing ? (
                    <><UserCheck size={18} /> Following</>
                  ) : (
                    <><UserPlus size={18} /> Follow</>
                  )}
                </button>
                <button 
                  onClick={() => router.push(`/messages/${params.id}`)}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 shadow-sm"
                >
                  <Inbox size={18} /> Message
                </button>
             </div>
          )}
       </div>
       
       <div className="p-4">
          <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-3 px-2">Active Listings</h2>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500 shadow-sm">
             Listing queries routing will populate here in the next sprint.
          </div>
       </div>
    </div>
  );
}
