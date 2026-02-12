import { useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeIndianPhone, isValidIndianPhone } from '@/utils/donationInputNormalization';
import { Gender } from '@/backend';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [gender, setGender] = useState<Gender | ''>('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Normalize and validate phone
  const normalizedPhone = normalizeIndianPhone(phone);
  const isPhoneValid = phone === '+91' || isValidIndianPhone(normalizedPhone);

  // Validate age
  const ageValue = age ? parseInt(age, 10) : null;
  const isAgeValid = !age || (ageValue !== null && ageValue > 0 && ageValue <= 150);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!age.trim()) {
      toast.error('Please enter your age');
      return;
    }

    if (!isAgeValid) {
      toast.error('Please enter a valid age (1-150)');
      return;
    }

    if (!phone || phone === '+91') {
      toast.error('Please enter your mobile number');
      return;
    }

    if (!isPhoneValid) {
      toast.error('Please enter a valid 10-digit Indian mobile number with +91 country code');
      return;
    }

    if (!gender) {
      toast.error('Please select your gender');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        age: ageValue ? BigInt(ageValue) : undefined,
        email: email.trim() || undefined,
        phone: normalizedPhone,
        gender: gender as Gender,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>
            Please provide your details to personalize your experience and enable donations.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="150"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              required
            />
            {age && !isAgeValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Please enter a valid age (1-150)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
              className={phone !== '+91' && isPhoneValid ? 'border-green-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Enter your 10-digit mobile number with +91 (required for donations)
            </p>
            {phone && phone !== '+91' && !isPhoneValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid phone format. Use +91 followed by 10 digits (6-9 first)
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as Gender)} required>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.male}>Male</SelectItem>
                <SelectItem value={Gender.female}>Female</SelectItem>
                <SelectItem value={Gender.other}>Other</SelectItem>
                <SelectItem value={Gender.preferNotToSay}>Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={saveProfile.isPending || !name.trim() || !age.trim() || !phone || phone === '+91' || !gender || !isPhoneValid || !isAgeValid}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
