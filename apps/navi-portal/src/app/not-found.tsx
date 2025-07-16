"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-full bg-background flex items-center justify-center p-4">
      <div className="w-full text-center">
        <div className="bg-card border border-customborder rounded-lg p-8 shadow-md">
          {/* 404 Illustration */}
          <div className="mb-6">
            <div className="text-6xl font-bold text-muted-foreground mb-2">
              404
            </div>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Page Not Found
          </h1>

          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. The
            link you followed may be broken or the page may have been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>

            <Link href="#" onClick={() => window.history.back()}>
              <Button variant="outline">Go Back</Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-customborder">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
