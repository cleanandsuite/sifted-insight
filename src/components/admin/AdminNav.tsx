 import { useNavigate, useLocation } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Activity, Database, Newspaper, LogOut } from 'lucide-react';
 
 interface AdminNavProps {
   displayName?: string | null;
   email?: string;
   onSignOut: () => void;
 }
 
 export const AdminNav = ({ displayName, email, onSignOut }: AdminNavProps) => {
   const navigate = useNavigate();
   const location = useLocation();
 
   const isActive = (path: string) => location.pathname === path;
 
   return (
     <header className="sticky top-0 z-50 bg-card border-b-4 border-black">
       <div className="container mx-auto px-4 py-4 flex items-center justify-between">
         <div className="flex items-center gap-6">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-black">
               <Activity className="w-6 h-6 text-primary-foreground" />
             </div>
             <div>
               <h1 className="font-black text-xl">SIFT Admin</h1>
               <p className="text-sm text-muted-foreground">
                 Welcome, {displayName || email}
               </p>
             </div>
           </div>
           
           {/* Navigation Tabs */}
           <nav className="hidden md:flex items-center gap-1 ml-6">
             <Button
               variant={isActive('/admin/dashboard') ? 'default' : 'ghost'}
               size="sm"
               onClick={() => navigate('/admin/dashboard')}
               className={`font-bold ${isActive('/admin/dashboard') ? 'border-2 border-black' : ''}`}
             >
               <Activity className="w-4 h-4 mr-2" />
               Dashboard
             </Button>
             <Button
               variant={isActive('/admin/sources') ? 'default' : 'ghost'}
               size="sm"
               onClick={() => navigate('/admin/sources')}
               className={`font-bold ${isActive('/admin/sources') ? 'border-2 border-black' : ''}`}
             >
               <Database className="w-4 h-4 mr-2" />
               Sources
             </Button>
           </nav>
         </div>
         
         <div className="flex items-center gap-3">
           <Button
             variant="outline"
             size="sm"
             onClick={() => navigate('/')}
             className="border-2 border-black font-bold"
           >
             <Newspaper className="w-4 h-4 mr-2" />
             View Site
           </Button>
           <Button
             variant="destructive"
             size="sm"
             onClick={onSignOut}
             className="border-2 border-black font-bold"
           >
             <LogOut className="w-4 h-4 mr-2" />
             Sign Out
           </Button>
         </div>
       </div>
     </header>
   );
 };