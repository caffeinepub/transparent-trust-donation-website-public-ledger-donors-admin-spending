import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { SITE_DOMAIN } from '@/utils/siteConfig';
import { getCanisterId } from '@/utils/siteConfig';

export default function DomainSetupPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const canisterId = getCanisterId();
  const customDomain = 'whynotus.org.in';
  const icGateway = `${canisterId}.icp0.io`;
  
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Custom Domain Setup</h1>
        <p className="text-muted-foreground">
          Configure DNS records to point {customDomain} to your Internet Computer canister
        </p>
      </div>

      {/* Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Overview
          </CardTitle>
          <CardDescription>
            Your application is currently hosted on the Internet Computer network. To use your custom domain ({customDomain}), you need to configure DNS records with your domain registrar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[140px]">Current Domain:</span>
              <span className="text-muted-foreground">{icGateway}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[140px]">Target Domain:</span>
              <span className="text-muted-foreground">{customDomain}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold min-w-[140px]">Canister ID:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{canisterId}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: CNAME Record */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Add CNAME Record</CardTitle>
          <CardDescription>
            Point your domain to the Internet Computer gateway
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium">Record Type</div>
                <code className="text-sm bg-background px-2 py-1 rounded">CNAME</code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('CNAME', 'Record Type')}
              >
                {copiedField === 'Record Type' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium">Name / Host</div>
                <code className="text-sm bg-background px-2 py-1 rounded">@</code>
                <p className="text-xs text-muted-foreground mt-1">
                  (or leave blank, or use "whynotus.org.in" depending on your registrar)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('@', 'Host')}
              >
                {copiedField === 'Host' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium">Value / Points to</div>
                <code className="text-sm bg-background px-2 py-1 rounded break-all">
                  {icGateway}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(icGateway, 'CNAME Value')}
              >
                {copiedField === 'CNAME Value' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium">TTL</div>
                <code className="text-sm bg-background px-2 py-1 rounded">3600</code>
                <p className="text-xs text-muted-foreground mt-1">(1 hour, or use default)</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('3600', 'TTL')}
              >
                {copiedField === 'TTL' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Important Note:</p>
                <p>
                  Some domain registrars (like GoDaddy) don't allow CNAME records on the root domain (@). 
                  In that case, you may need to use an A record or ALIAS record instead. Contact your registrar's 
                  support for guidance on pointing your root domain to {icGateway}.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Verification */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Verify DNS Configuration</CardTitle>
          <CardDescription>
            Wait for DNS propagation and verify your setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Save your DNS records</p>
                <p className="text-sm text-muted-foreground">
                  Log in to your domain registrar (GoDaddy, Namecheap, etc.) and add the CNAME record above.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Wait for DNS propagation</p>
                <p className="text-sm text-muted-foreground">
                  DNS changes can take 5 minutes to 48 hours to propagate globally. Typically, it takes 15-30 minutes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Test your domain</p>
                <p className="text-sm text-muted-foreground">
                  Visit {customDomain} in your browser to verify it's working correctly.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`https://${customDomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Test Domain
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>
            Common issues and solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">Domain not resolving after 24 hours?</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>Double-check that the CNAME record is saved correctly</li>
                <li>Ensure there are no conflicting A records for the same hostname</li>
                <li>Clear your browser cache and DNS cache</li>
                <li>Try accessing from a different device or network</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">SSL/HTTPS certificate issues?</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>The Internet Computer automatically provisions SSL certificates</li>
                <li>This can take a few minutes after DNS propagation completes</li>
                <li>If you see a certificate warning, wait 10-15 minutes and try again</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-1">Need help?</p>
              <p className="text-muted-foreground">
                Contact your domain registrar's support team for assistance with DNS configuration, 
                or reach out to the Internet Computer community forums for canister-specific questions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
