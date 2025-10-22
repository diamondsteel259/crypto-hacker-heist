import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-matrix-green p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-cyber-blue hover:text-matrix-green transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Game
            </button>
          </Link>
          <h1 className="text-3xl font-bold font-orbitron text-matrix-green mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: October 22, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Welcome to Crypto Hacker Heist's Privacy Policy. We are committed to protecting your privacy and
                ensuring transparency about how we collect, use, and protect your information.
              </p>
              <p>
                This policy explains what data we collect when you play our Telegram Mini App game and how we use it.
                By using the game, you consent to the practices described in this policy.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">2.1 Telegram Account Information</h4>
                <p>When you access the game through Telegram, we collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Your Telegram user ID (numerical identifier)</li>
                  <li>Your Telegram username (if public)</li>
                  <li>Your display name</li>
                  <li>Your profile photo URL (if public)</li>
                </ul>
                <p className="text-sm text-gray-400 mt-2">
                  This information is provided by Telegram through their secure authentication system.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">2.2 Game Data</h4>
                <p>As you play, we collect and store:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Your game progress and achievements</li>
                  <li>Virtual currency balance (Cyber Score)</li>
                  <li>Equipment, power-ups, and items owned</li>
                  <li>Mining statistics and hashrate</li>
                  <li>Leaderboard rankings and scores</li>
                  <li>Referral relationships and rewards</li>
                  <li>Daily login streaks and activity patterns</li>
                  <li>Prestige level and seasonal progression</li>
                </ul>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">2.3 TON Wallet Information (Optional)</h4>
                <p>If you connect a TON wallet, we collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Your wallet address</li>
                  <li>Transaction hashes for verification</li>
                </ul>
                <p className="text-yellow-400 text-sm mt-2">
                  Important: We never have access to your private keys or seed phrases. Wallet connections are
                  managed through TON Connect, a secure third-party protocol.
                </p>
              </div>

              <div>
                <h4 className="text-cyan-400 font-semibold mb-2">2.4 Technical Information</h4>
                <p>We automatically collect:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Device type and operating system</li>
                  <li>Browser type and version</li>
                  <li>IP address (for security and fraud prevention)</li>
                  <li>Session duration and activity timestamps</li>
                  <li>Error logs and diagnostic data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                3. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and operate the game</li>
                <li>Maintain your account and game progress</li>
                <li>Calculate mining rewards and distribute Cyber Score</li>
                <li>Display leaderboards and rankings</li>
                <li>Process referral rewards</li>
                <li>Verify TON wallet transactions (if connected)</li>
                <li>Prevent cheating, fraud, and abuse</li>
                <li>Improve game balance and features</li>
                <li>Provide customer support</li>
                <li>Send game notifications through Telegram</li>
                <li>Analyze usage patterns to improve the game</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                4. Data Storage and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                <strong>Where We Store Data:</strong> Your data is stored in secure databases hosted by reputable
                cloud providers (Render.com with PostgreSQL). All data transmission is encrypted using industry-standard
                protocols (HTTPS/TLS).
              </p>
              <p>
                <strong>How Long We Keep Data:</strong> We retain your game data as long as your account is active.
                If you become inactive, we may delete your data after 12 months of inactivity.
              </p>
              <p>
                <strong>Security Measures:</strong> We implement security measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure database access controls</li>
                <li>Rate limiting to prevent abuse</li>
                <li>Regular security monitoring</li>
                <li>Secure authentication through Telegram</li>
              </ul>
              <p className="text-yellow-400 mt-4">
                <strong>No Perfect Security:</strong> While we take reasonable measures to protect your data,
                no internet transmission or storage system is 100% secure. We cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                5. Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                <strong>We DO NOT sell your personal information to third parties.</strong>
              </p>
              <p>We may share your information with:</p>

              <div className="space-y-3">
                <div>
                  <h4 className="text-cyan-400 font-semibold">Service Providers:</h4>
                  <p className="text-sm">
                    Cloud hosting providers (Render.com), database services, and analytics tools that help us operate the game.
                  </p>
                </div>

                <div>
                  <h4 className="text-cyan-400 font-semibold">Public Leaderboards:</h4>
                  <p className="text-sm">
                    Your username and scores are displayed on public leaderboards visible to other players.
                  </p>
                </div>

                <div>
                  <h4 className="text-cyan-400 font-semibold">Legal Requirements:</h4>
                  <p className="text-sm">
                    We may disclose information if required by law, court order, or to protect our rights and safety.
                  </p>
                </div>

                <div>
                  <h4 className="text-cyan-400 font-semibold">TON Blockchain:</h4>
                  <p className="text-sm">
                    If you connect a TON wallet, transaction data is recorded on the public TON blockchain,
                    which is immutable and publicly visible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                6. Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>The game integrates with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Telegram:</strong> Authentication and account linking (see Telegram's Privacy Policy)</li>
                <li><strong>TON Connect:</strong> Wallet connection protocol (see TON's Privacy Policy)</li>
                <li><strong>Render.com:</strong> Hosting infrastructure (see Render's Privacy Policy)</li>
              </ul>
              <p>
                These third-party services have their own privacy policies. We are not responsible for their
                privacy practices.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                7. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Correction:</strong> Request corrections to inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Opt-Out:</strong> Opt out of certain data collection</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us through:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li>• Our Telegram bot: @CryptoHackerHeistbot</li>
                <li>• In-game support system</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                Note: Deleting your account will permanently remove all game progress and virtual items.
                This action cannot be undone.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                8. Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                The game is not directed to children under 13 years of age. We do not knowingly collect personal
                information from children under 13.
              </p>
              <p>
                If you believe a child under 13 has provided us with personal information, please contact us
                immediately, and we will delete such information.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                9. Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                We use local storage and session storage in your browser to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintain your login session</li>
                <li>Store game preferences and settings</li>
                <li>Cache game data for better performance</li>
              </ul>
              <p>
                We do not use third-party advertising cookies or tracking pixels.
              </p>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                10. International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                The game is accessible worldwide. Your data may be transferred to and stored in countries other
                than your own. By using the game, you consent to such transfers.
              </p>
              <p>
                We take measures to ensure your data is protected in accordance with this privacy policy,
                regardless of where it is processed.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                11. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy in the game</li>
                <li>Updating the "Last Updated" date above</li>
                <li>Sending notifications through Telegram (for major changes)</li>
              </ul>
              <p>
                Your continued use of the game after changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                12. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data,
                please contact us:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li>• Through our Telegram bot: @CryptoHackerHeistbot</li>
                <li>• Via the in-game support system</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                We will respond to your inquiries within a reasonable timeframe.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-6 pb-4 text-center text-gray-500 text-sm border-t border-matrix-green/20">
            <p>© 2025 Crypto Hacker Heist. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/terms" className="text-cyber-blue hover:text-matrix-green">Terms of Service</Link>
              {" • "}
              <Link href="/" className="text-cyber-blue hover:text-matrix-green">Back to Game</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
