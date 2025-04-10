
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings, toggleNotifications } from '@/api/settings';
import { updateDetails, updatePassword } from '@/api/auth';
import { UserSettings } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Loader2, Moon, Sun } from 'lucide-react';

const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  newPassword: z.string().min(6, {
    message: "New password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Confirm password must be at least 6 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings: React.FC = () => {
  const { state, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isEmailNotifications, setIsEmailNotifications] = useState(false);
  const [isInAppNotifications, setIsInAppNotifications] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: state.user?.username || "",
      email: state.user?.email || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success) {
          setSettings(response.data);
          setIsEmailNotifications(response.data.notifications.email);
          setIsInAppNotifications(response.data.notifications.inApp);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load settings",
          description: "There was an error loading your settings.",
        });
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdatingProfile(true);
    try {
      const response = await updateDetails({
        username: data.username,
        email: data.email,
      });

      if (response.success) {
        updateUser(response.data);
        toast({
          title: "Profile updated",
          description: "Your profile information has been updated.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description: error.response?.data?.message || "There was an error updating your profile.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsUpdatingPassword(true);
    try {
      const response = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        passwordForm.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update password",
        description: error.response?.data?.message || "There was an error updating your password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      await updateSettings({ theme: newTheme });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update theme",
        description: "There was an error updating your theme preference.",
      });
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'inApp', value: boolean) => {
    try {
      if (type === 'email') {
        setIsEmailNotifications(value);
      } else {
        setIsInAppNotifications(value);
      }

      await toggleNotifications({ [type]: value });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update notification settings",
        description: "There was an error updating your notification preferences.",
      });
      
      // Reset the toggle if the API call fails
      if (type === 'email') {
        setIsEmailNotifications(!value);
      } else {
        setIsInAppNotifications(!value);
      }
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and how it appears across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {state.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{state.user?.username}</h4>
                  <p className="text-sm text-muted-foreground">{state.user?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update profile'
                    )}
                  </Button>
                </form>
              </Form>
              
              <Separator />
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <h3 className="font-medium">Change Password</h3>
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Change password'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you want to receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about course updates via email.
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={isEmailNotifications}
                    onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inAppNotifications" className="font-medium">
                      In-App Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications within the application.
                    </p>
                  </div>
                  <Switch
                    id="inAppNotifications"
                    checked={isInAppNotifications}
                    onCheckedChange={(checked) => handleNotificationToggle('inApp', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-all ${
                        theme === 'light' ? 'border-primary bg-secondary' : ''
                      }`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="h-24 w-full rounded-md bg-white border mb-2 flex items-center justify-center">
                        <Sun className="h-8 w-8 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium">Light</span>
                    </div>
                    <div
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-all ${
                        theme === 'dark' ? 'border-primary bg-secondary' : ''
                      }`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="h-24 w-full rounded-md bg-zinc-900 border border-gray-700 mb-2 flex items-center justify-center">
                        <Moon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    <div
                      className={`flex flex-col items-center p-3 border rounded-md cursor-pointer transition-all ${
                        theme === 'system' ? 'border-primary bg-secondary' : ''
                      }`}
                      onClick={() => handleThemeChange('system')}
                    >
                      <div className="h-24 w-full rounded-md bg-gradient-to-r from-white to-zinc-900 border mb-2 flex items-center justify-center">
                        <div className="flex">
                          <Sun className="h-8 w-8 text-amber-500" />
                          <Moon className="h-8 w-8 text-indigo-400" />
                        </div>
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
