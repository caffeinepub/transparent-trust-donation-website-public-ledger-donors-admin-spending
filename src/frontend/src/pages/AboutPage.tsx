import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Target, Lightbulb } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b border-border/40">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About Us</h1>
            <p className="text-lg text-muted-foreground">
              Two college students with a vision to make transparent giving accessible to everyone
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-xl">Md Anwarul Haq.S</CardTitle>
              <p className="text-sm text-muted-foreground">Founder, Treasurer & Managing Trustee</p>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-sm">18 years old</p>
              <p className="text-sm text-muted-foreground">
                B.E in Electronics and Communication Engineering
              </p>
              <p className="text-sm text-muted-foreground">
                Aalim Muhammed Salegh College of Engineering, Chennai
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-xl">Mohamed Hafeez.M</CardTitle>
              <p className="text-sm text-muted-foreground">Co-Founder & Trustee</p>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <p className="text-sm">18 years old</p>
              <p className="text-sm text-muted-foreground">
                B.E in Electronics and Communication Engineering
              </p>
              <p className="text-sm text-muted-foreground">
                Aalim Muhammed Salegh College of Engineering, Chennai
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="container pb-12">
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <Target className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Our Vision</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              To create a world where every act of giving is transparent, traceable, and truly impactful for those who need it most.
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              To build trust through 100% transparency, showing donors exactly how their contributions are used to help the needy.
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <Lightbulb className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Why We Started</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              As young students, we saw the need for transparent charitable giving. Why Not Us? We can make a difference, one donation at a time.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Story Section */}
      <section className="container pb-12">
        <Card className="max-w-3xl mx-auto border-primary/20">
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We are two 18-year-old college students from Chennai, Tamil Nadu, pursuing our dreams in Electronics and Communication Engineering at Aalim Muhammed Salegh College of Engineering.
            </p>
            <p>
              While studying technology, we realized we could use our skills to solve a real problem: the lack of transparency in charitable giving. Many people want to help, but they don't know where their money goes or how it's used.
            </p>
            <p>
              That's why we created "Why Not Us?" – a platform where every donation is tracked, every expense is visible, and every donor can see the real impact of their contribution. We believe that transparency builds trust, and trust builds a better community.
            </p>
            <p className="font-medium text-foreground">
              We're young, we're passionate, and we're committed to making a difference. Join us in this journey of transparent giving.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
