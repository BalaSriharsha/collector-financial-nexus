
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CancellationRefund = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-collector-gold/20 p-8">
          <h1 className="text-3xl font-playfair font-bold text-collector-black mb-6">Cancellation & Refund Policy</h1>
          <p className="text-sm text-collector-black/70 mb-8">Last updated: June 1, 2025</p>

          <div className="space-y-6 text-collector-black/80">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Subscription Cancellation</h2>
              <p className="mb-3">You can cancel your subscription at any time through your account settings or by contacting our support team.</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Cancellations take effect at the end of your current billing period</li>
                <li>You will continue to have access to premium features until the end of your paid period</li>
                <li>No partial refunds will be provided for unused time in your billing period</li>
                <li>Your account will automatically downgrade to the free tier after cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Free Trial Cancellation</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You can cancel your free trial at any time without charge</li>
                <li>If you cancel during the trial period, you will not be charged</li>
                <li>If you don't cancel before the trial ends, you will be charged for the subscription</li>
                <li>Trial cancellations are immediate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Refund Policy</h2>
              <p className="mb-3">All subscription fees are generally non-refundable. However, we may provide refunds in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Technical issues that prevent you from using the service for an extended period</li>
                <li>Billing errors on our part</li>
                <li>Duplicate charges</li>
                <li>Service unavailability for more than 48 consecutive hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Refund Process</h2>
              <p className="mb-3">To request a refund:</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Contact our support team at support@vittas.app within 7 days of the charge</li>
                <li>Provide your account information and reason for the refund request</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>Approved refunds will be processed within 5-10 business days</li>
                <li>Refunds will be credited to the original payment method</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Payment Disputes</h2>
              <p>If you have a dispute about a charge, please contact us first before disputing with your payment provider. We're committed to resolving issues quickly and fairly.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Auto-Renewal</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You will receive email notifications before renewal</li>
                <li>You can disable auto-renewal in your account settings</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
              <p>For cancellation or refund requests, please contact:</p>
              <div className="mt-2">
                <p>Email: support@vittas.app</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Response time: Within 24 hours</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CancellationRefund;
