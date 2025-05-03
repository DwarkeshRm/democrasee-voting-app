
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { registerUser } from '@/services/votingService';
import { CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

const RegisterForm = ({ onRegisterSuccess, onLoginClick }: RegisterFormProps) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    // Admin registration validation
    if (showAdminCode) {
      if (!adminCode.trim()) {
        toast({
          title: "Error",
          description: "Please enter admin code",
          variant: "destructive",
        });
        return;
      }
      
      if (adminCode !== "admin123") { // Simple admin code for demo purposes
        toast({
          title: "Error",
          description: "Invalid admin code",
          variant: "destructive",
        });
        return;
      }
    }
    
    const user = registerUser(username, password, showAdminCode);
    
    if (user) {
      toast({
        title: "Registration successful",
        description: showAdminCode 
          ? "You have been registered as an admin. You can now login."
          : "You can now login with your credentials",
      });
      onRegisterSuccess();
    } else {
      toast({
        title: "Registration failed",
        description: "Username already exists or an error occurred",
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
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
              placeholder="Choose a password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="adminRegister" 
              checked={showAdminCode}
              onCheckedChange={(checked) => setShowAdminCode(!!checked)} 
            />
            <Label htmlFor="adminRegister" className="font-medium">
              Register as Admin
            </Label>
          </div>
          
          {showAdminCode && (
            <div className="space-y-2">
              <Label htmlFor="adminCode">Admin Code</Label>
              <Input 
                id="adminCode" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                placeholder="Enter admin code"
                required={showAdminCode}
              />
              <p className="text-sm text-muted-foreground">
                Enter the admin code provided to you.
              </p>
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={onLoginClick}>
          Already have an account? Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
