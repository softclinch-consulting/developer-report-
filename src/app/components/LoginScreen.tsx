import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { User } from '../types/record';
import { AlertCircle } from 'lucide-react';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/constants';
import { BrandLogo } from './BrandLogo';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.toLowerCase().trim();
    
    if (trimmedEmail) {
      // Determine role based on email match with admin email
      const isAdmin = trimmedEmail === ADMIN_EMAIL.toLowerCase();
      if (isAdmin && password !== ADMIN_PASSWORD) {
        alert('Invalid admin password.');
        return;
      }
      const role = isAdmin ? 'admin' : 'developer';
      onLogin({ email: trimmedEmail, role });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo size="md" showTagline />
          </div>
          <CardTitle className="text-2xl">Developer Task Tracker</CardTitle>
          <CardDescription>
            Sign in with your email to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (Admin only)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="bg-[#eff4ff] border border-[#c9d7ff] rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-[#0A2E8A] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[#0A2E8A]">
                <p className="font-medium mb-1">Role Assignment:</p>
                <p>Your role is automatically determined by your email address.</p>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
