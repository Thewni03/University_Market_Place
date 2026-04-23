import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const location = useLocation();
  const normalizedPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const hideFooter = [
    "/", 
    "/login", 
    "/register", 
    "/signup",
    "/verificationstatushandler", 
    "/pending"
  ].includes(normalizedPath);

  if (hideFooter) return null;

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto">
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link to="/home" className="flex items-center gap-2 shrink-0 w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(152_60%_32%)]">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">
                UniMarket
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              The premier marketplace and social hub built exclusively for university students. Buy, sell, connect, and collaborate securely.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Explore</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/home" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
              <Link to="/feed" className="hover:text-primary transition-colors">Campus Feed</Link>
              <Link to="/forum" className="hover:text-primary transition-colors">Q&A Forum</Link>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/create-service" className="hover:text-primary transition-colors">Offer a Service</Link>
              <Link to="/post-request" className="hover:text-primary transition-colors">Post a Request</Link>
              <Link to="/reviewandrating" className="hover:text-primary transition-colors">Reviews & Ratings</Link>
              <Link to="/dashboard" className="hover:text-primary transition-colors">Talk Space</Link>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contact Us</h4>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <span>0112 701 655 / 077 515 5598</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@unimarket.lk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between border-t border-border mt-12 pt-8 gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} UniMarket. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
