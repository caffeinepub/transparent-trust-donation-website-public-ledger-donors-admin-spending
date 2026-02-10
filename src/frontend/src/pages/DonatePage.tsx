import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import DonationForm from '@/components/donate/DonationForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Shield, Eye, Users } from 'lucide-react';

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
              Your contribution directly supports those in need. Every donation is tracked transparently 
              and used responsibly to create positive change.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your donation is processed securely on the blockchain.
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
                  Track exactly how your contribution is used.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Impactful</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join a community making real change.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Donation Details</CardTitle>
              <CardDescription>
                {identity 
                  ? `Donating as ${userProfile?.name || 'authenticated user'}`
                  : 'You can donate anonymously or sign in to track your contributions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DonationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
