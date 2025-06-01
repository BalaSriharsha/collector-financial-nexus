
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-collector-gold/20 p-8">
          <h1 className="text-3xl font-playfair font-bold text-collector-black mb-6">Privacy Policy</h1>
          <p className="text-sm text-collector-black/70 mb-8">Last updated: June 1, 2025</p>

          <div className="space-y-6 text-collector-black/80">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect information you provide directly to us, such as when you create an account, use our services, or contact us.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Personal information (name, email address, phone number)</li>
                <li>Financial data (transaction information, account balances, payment methods)</li>
                <li>Usage data (how you interact with our platform)</li>
                <li>Device information (IP address, browser type, operating system)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our financial management services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and customer service requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing and Disclosure</h2>
              <p className="mb-3">We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>With service providers who assist us in operating our platform</li>
                <li>In connection with business transfers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure data transmission, and regular security assessments.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Delete your account and personal data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Lodge a complaint with supervisory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-2">
                <p>Email: privacy@vittas.app</p>
                <p>Address: San Francisco, CA</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
