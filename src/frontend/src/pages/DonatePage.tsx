import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import DonationForm from '@/components/donate/DonationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, Eye, Users, Smartphone, Info } from 'lucide-react';

export default function DonatePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Heart className="h-8 w-8 text-primary fill-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Make a Difference Today</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your contribution directly supports those in need. Every donation is verified, tracked transparently, 
              and used responsibly to create positive change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Smartphone className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">UPI Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pay securely using the UPI ID with any UPI app - Google Pay, PhonePe, Paytm, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Every donation is verified by our admin team using your UPI Transaction ID (UTR) for complete transparency.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track exactly how your contribution is used on our public ledger.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donation Process</CardTitle>
              <CardDescription>
                {identity 
                  ? `Donating as ${userProfile?.name || 'authenticated user'}`
                  : 'You can donate anonymously or sign in to track your contributions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-accent/10 rounded-lg border-2 border-accent/30">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-base mb-1">Quick Payment Guide</p>
                    <p className="text-sm text-foreground/90">
                      Use the UPI ID to pay the exact amount via any UPI app, then enter your 12-digit UTR/Transaction ID from the payment confirmation to submit for verification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h3 className="font-semibold mb-2 text-sm">How it works:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Enter your mobile number (required) and donation amount in INR</li>
                  <li>Use the UPI ID provided to complete payment via any UPI app</li>
                  <li>Enter your UPI Transaction ID (UTR) from the payment confirmation</li>
                  <li>Submit the form - our admin will verify and confirm your donation</li>
                </ol>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/30">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0 fill-primary" />
                  <div>
                    <p className="font-semibold text-base mb-2">Thank You for Your Generosity</p>
                    <p className="text-sm text-foreground/90 mb-2">
                      Every contribution makes a real difference in the lives of those we serve. Your donation will be carefully verified by our admin team to ensure complete transparency and accountability.
                    </p>
                    <p className="text-sm text-foreground/90">
                      Once verified, your donation will be permanently recorded on our public ledger, where you can track exactly how your contribution is being used to create positive change in our community.
                    </p>
                  </div>
                </div>
              </div>

              <DonationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
