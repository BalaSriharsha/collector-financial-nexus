
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-collector-gold/20 p-8">
          <h1 className="text-3xl font-playfair font-bold text-collector-black mb-6">Terms of Service</h1>
          <p className="text-sm text-collector-black/70 mb-8">Last updated: June 1, 2025</p>

          <div className="space-y-6 text-collector-black/80">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Vittas, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p>Vittas is a financial management platform that provides tools for tracking expenses, managing budgets, generating reports, and organizing financial data. Our service is provided "as is" and we reserve the right to modify or discontinue features at any time.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must be at least 18 years old to create an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate and complete information</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Subscription and Payment</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscription fees are billed in advance on a monthly basis</li>
                <li>Premium plans include a 7-day free trial period</li>
                <li>Payments are processed securely through Razorpay</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Share your account with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data and Privacy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p>In no event shall Vittas be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
              <p>Questions about the Terms of Service should be sent to us at legal@vittas.app</p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
