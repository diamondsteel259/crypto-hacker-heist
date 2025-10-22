import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm">
            Last Updated: October 22, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Acceptance */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Welcome to Crypto Hacker Heist, a blockchain simulation game available as a Telegram Mini App.
                By accessing or using our game, you agree to be bound by these Terms of Service.
              </p>
              <p>
                If you do not agree to these terms, please do not use the game. We reserve the right to modify
                these terms at any time, and your continued use constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          {/* Game Rules */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                2. Game Rules and Gameplay
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Crypto Hacker Heist is a simulation game where players:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Mine virtual blocks to earn Cyber Score (CS), an in-game currency</li>
                <li>Purchase equipment, power-ups, and upgrades to improve mining efficiency</li>
                <li>Compete on leaderboards with other players</li>
                <li>Complete challenges and achievements</li>
                <li>Optionally connect TON wallets for blockchain integration</li>
              </ul>
              <p className="text-yellow-400 mt-4">
                <strong>Important:</strong> All gameplay mechanics are simulated. This is not real cryptocurrency mining
                and does not generate actual cryptocurrency or blockchain transactions unless explicitly connected to TON wallet features.
              </p>
            </CardContent>
          </Card>

          {/* Virtual Currency */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                3. Virtual Currency and Items
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                <strong>Cyber Score (CS)</strong> is a virtual currency used exclusively within the game. CS has no real-world monetary value and cannot be exchanged for real money or cryptocurrency outside the game's ecosystem.
              </p>
              <p>
                All purchases made with CS are final. Virtual items, equipment, and power-ups purchased in the game:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Are non-transferable and non-refundable</li>
                <li>Have no monetary value</li>
                <li>May be modified, removed, or have their attributes changed at our discretion</li>
                <li>Are licensed, not sold, for your personal use within the game</li>
              </ul>
              <p className="text-yellow-400 mt-4">
                <strong>TON Integration:</strong> If you choose to use TON wallet features, those transactions are
                governed by the TON blockchain and are separate from CS. We are not responsible for TON transactions
                or wallet security.
              </p>
            </CardContent>
          </Card>

          {/* Account and Access */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                4. Account and Access
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                Your account is linked to your Telegram account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the security of your Telegram account</li>
                <li>All activities that occur under your account</li>
                <li>Not sharing your account with others</li>
                <li>Reporting any unauthorized use immediately</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate these terms</li>
                <li>Use automated tools, bots, or scripts</li>
                <li>Exploit bugs or glitches for unfair advantage</li>
                <li>Engage in harassment or abusive behavior</li>
                <li>Attempt to manipulate game mechanics or leaderboards</li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Conduct */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                5. Prohibited Conduct
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reverse engineer, decompile, or disassemble the game</li>
                <li>Create multiple accounts to gain unfair advantages</li>
                <li>Use third-party software to automate gameplay</li>
                <li>Exploit bugs, glitches, or errors in the game</li>
                <li>Engage in any form of cheating or hacking</li>
                <li>Harass, threaten, or abuse other players</li>
                <li>Impersonate other users or entities</li>
                <li>Attempt to gain unauthorized access to game systems</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                6. Service Availability and Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                We strive to provide continuous service but do not guarantee uninterrupted access. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify, suspend, or discontinue the game at any time</li>
                <li>Perform maintenance and updates without notice</li>
                <li>Change game mechanics, features, or content</li>
                <li>Reset or modify leaderboards and rankings</li>
              </ul>
              <p>
                We are not liable for any interruption of service, loss of progress, or loss of virtual items.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                7. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                THE GAME IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p>
                We disclaim all warranties, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of game content</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data transmission or storage</li>
              </ul>
              <p className="text-yellow-400 mt-4">
                <strong>No Financial Advice:</strong> Nothing in this game constitutes financial, investment, or
                cryptocurrency advice. The game is for entertainment purposes only.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                8. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, or goodwill</li>
                <li>Interruption of service or loss of virtual items</li>
                <li>Unauthorized access to your account</li>
                <li>Errors, bugs, or glitches in the game</li>
              </ul>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE LAST 12 MONTHS (IF ANY).
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                9. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                We may terminate or suspend your access immediately, without prior notice, for any reason, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Breach of these Terms of Service</li>
                <li>Engaging in prohibited conduct</li>
                <li>At our sole discretion</li>
              </ul>
              <p>
                Upon termination, your right to use the game ceases immediately. All provisions that should survive
                termination shall survive, including ownership, warranty disclaimers, and limitations of liability.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                10. Governing Law and Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                These Terms shall be governed by and construed in accordance with applicable international laws.
                Any disputes arising from these terms or your use of the game shall be resolved through binding
                arbitration or in the courts of appropriate jurisdiction.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-gray-900/50 border-matrix-green/30">
            <CardHeader>
              <CardTitle className="text-matrix-green font-orbitron">
                11. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-3">
              <p>
                If you have questions about these Terms of Service, please contact us through:
              </p>
              <ul className="list-none space-y-2 ml-4">
                <li>• Our Telegram bot: @CryptoHackerHeistbot</li>
                <li>• In-game support system</li>
              </ul>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="pt-6 pb-4 text-center text-gray-500 text-sm border-t border-matrix-green/20">
            <p>© 2025 Crypto Hacker Heist. All rights reserved.</p>
            <p className="mt-2">
              <Link href="/privacy" className="text-cyber-blue hover:text-matrix-green">Privacy Policy</Link>
              {" • "}
              <Link href="/" className="text-cyber-blue hover:text-matrix-green">Back to Game</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
