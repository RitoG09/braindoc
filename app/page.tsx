import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ZapIcon,
  ServerCogIcon,
  BookOpenIcon,
  SearchIcon,
  Brain,
  InstagramIcon,
  Github,
  Linkedin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import img from "@/public/photo.png";
import axios from "axios";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const features = [
  {
    name: "Store Your Documents",
    description:
      "Keep all your important PDF files securely stored and easily accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "AI-Powered Analysis",
    description:
      "Our intelligent system reads and understands your documents, making information retrieval effortless.",
    icon: BrainCogIcon,
  },
  {
    name: "Instant Insights",
    description:
      "Extract key information from lengthy documents in seconds with smart content summarization.",
    icon: EyeIcon,
  },
  {
    name: "Cross-Platform Access",
    description:
      "Seamlessly access your documents and conversations from any device, browser, or location.",
    icon: MonitorSmartphoneIcon,
  },
  {
    name: "Secure Processing",
    description:
      "Your documents are processed with enterprise-grade security and privacy protection.",
    icon: ServerCogIcon,
  },
  {
    name: "Lightning Fast",
    description:
      "Get immediate responses to your questions about any document with our optimized retrieval system.",
    icon: ZapIcon,
  },
];

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-1">
              <Brain className="text-indigo-600" />
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-indigo-600">
                  BrainDoc.
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <SignedIn>
                <nav className="hidden md:flex space-x-8 mr-6">
                  <Link
                    href="/dashboard/upload"
                    className="text-gray-600 hover:text-gray-900 font-medium nav-link"
                  >
                    Upload
                  </Link>
                </nav>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <SignedOut>
                <div className="flex items-center gap-4">
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Sign Up</Button>
                  </SignUpButton>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-scroll bg-gradient-to-b from-white via-indigo-50 to-indigo-100">
        <div className="min-h-screen flex flex-col">
          {/* Hero Section */}
          <div className="py-16 md:py-24 px-6 lg:px-8 hero-gradient">
            <div className="flex flex-col justify-center items-center mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center animate-fade-in">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-indigo-100 border border-indigo-200">
                  <span className="text-sm font-medium text-indigo-800">
                    Your Interactive Document Companion
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                  Transform Docs into{" "}
                  <span className="text-indigo-600">Conversations</span>
                </h1>

                <p className="mt-8 text-lg md:text-xl leading-8 text-gray-600">
                  Upload your document and our AI will answer questions,
                  summarize content, and extract insights.
                  <span className="font-semibold text-indigo-600">
                    {" "}
                    BrainDoc{" "}
                  </span>
                  turns static documents into
                  <span className="font-bold"> dynamic conversations</span>,
                  enhancing productivity tenfold.
                </p>

                <div className="mt-10 flex items-center justify-center gap-6">
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-6 text-base rounded-xl"
                  >
                    <Link href="/dashboard/upload">Get Started</Link>
                  </Button>
                  <Link
                    href="/"
                    className="text-base font-semibold text-indigo-600 hover:text-indigo-500 nav-link"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div
            className="relative overflow-hidden px-6 lg:px-8 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mx-auto max-w-7xl">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={img}
                  alt="Braindoc in action"
                  width={2432}
                  height={1442}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent opacity-30"></div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Powerful Features
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to interact with your documents
                intelligently
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 feature-card"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <dt className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.name}
                  </dt>
                  <dd className="text-base text-gray-600">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* CTA Section */}
          <div
            className="bg-indigo-600 py-16 sm:py-24 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Ready to transform your document experience?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
                  Join thousands of users who are already chatting with their
                  PDFs
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 transition-transform"
                  >
                    <Link href="/dashboard/upload">Start for free</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer section */}
          <div className="flex justify-between items-center p-8">
            <p>
              Made with ❤️ by <strong>Rito</strong>
            </p>
            <nav className="hidden md:flex space-x-8 mr-6">
              <Link href="https://www.instagram.com/rito_1o18/?hl=en">
                <InstagramIcon />
              </Link>
              <Link href="https://github.com/RitoG09">
                <Github />
              </Link>
              <Link href="https://www.linkedin.com/in/ritog09/">
                <Linkedin />
              </Link>
            </nav>
          </div>
        </div>
      </main>
    </>
  );
}
