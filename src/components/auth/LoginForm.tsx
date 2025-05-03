
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { login } from '@/services/votingService';
import { CheckSquare } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onRegisterClick: () => void;
}

const LoginForm = ({ onLoginSuccess, onRegisterClick }: LoginFormProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    const user = login(username, password);
    
    if (user) {
      toast({
        title: "Login successful",
        description: user.isAdmin 
          ? `Welcome back, Admin ${user.username}!` 
          : `Welcome back, ${user.username}!`,
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <CheckSquare className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full">
            Login
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Use your regular or admin credentials to login
          </p>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={onRegisterClick}>
          Don't have an account? Register
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
