
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { resetAllUsers, logout, getCurrentUser } from '@/services/votingService';

const ResetData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const handleReset = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    // Reset all users except admin
    resetAllUsers();
    
    toast({
      title: "Success",
      description: "All user accounts have been reset. Only the admin account remains.",
    });
    
    navigate('/');
  };
  
  const handleCancel = () => {
    setIsConfirming(false);
    navigate('/');
  };
  
  // Check if user is admin
  if (getCurrentUser()?.isAdmin !== true) {
    return (
      <Layout>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unauthorized</AlertTitle>
              <AlertDescription>
                Only administrators can access this page.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Reset User Data</CardTitle>
          </CardHeader>
          <CardContent>
            {isConfirming ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Confirm Reset</AlertTitle>
                <AlertDescription>
                  This will delete all user accounts except the admin account. This action cannot be undone.
                </AlertDescription>
              </Alert>
            ) : (
              <p className="text-gray-600 mb-4">
                This will reset all user data in the system, removing all regular user accounts while preserving the admin account.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" onClick={handleCancel} className="w-1/2">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset} 
              className="w-1/2"
            >
              {isConfirming ? "Confirm Reset" : "Reset Users"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetData;
