"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  Key,
  Smartphone,
  LogOut,
  Monitor,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function SecurityClient() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Mock session data
  const sessions = [
    {
      id: 1,
      device: "Chrome on MacOS",
      location: "Tokyo, Japan",
      lastActive: "Now",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Tokyo, Japan",
      lastActive: "2 hours ago",
      current: false,
    },
    {
      id: 3,
      device: "Firefox on Windows",
      location: "Osaka, Japan",
      lastActive: "3 days ago",
      current: false,
    },
  ];

  return (
    <div className="w-full max-w-3xl space-y-10">
      {/* Section 1: Password */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Key size={18} />
          Password
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Change Password */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Change password</div>
                <div className="text-xs text-muted-foreground">
                  Update your password regularly for better security
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Two-Factor Authentication */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Smartphone size={18} />
          Two-Factor Authentication
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Enable 2FA */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Enable two-factor authentication</div>
                <div className="text-xs text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
              />
            </div>
            {twoFactorEnabled && (
              <>
                <Separator />
                <div className="flex items-center justify-between py-4 px-6">
                  <div className="space-y-0.5">
                    <div className="text-sm">Recovery codes</div>
                    <div className="text-xs text-muted-foreground">
                      Generate backup codes for account recovery
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View codes
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Active Sessions */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Monitor size={18} />
          Active Sessions
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {sessions.map((session, index) => (
              <div key={session.id}>
                <div className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Monitor size={18} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.location} · {session.lastActive}
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
                {index !== sessions.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Sign out all other sessions
          </Button>
        </div>
      </section>

      {/* Section 4: Danger Zone */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2 text-red-600">
          <Shield size={18} />
          Danger Zone
        </h2>
        <Card className="py-0 rounded-md border-red-200">
          <CardContent className="p-0">
            {/* Log Out */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Log out</div>
                <div className="text-xs text-muted-foreground">
                  Sign out of your account on this device
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <LogOut size={14} />
                Log out
              </Button>
            </div>
            <Separator />

            {/* Delete Account */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Delete account</div>
                <div className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
