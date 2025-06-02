
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ShippingDelivery = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-collector-gold/20 p-8">
          <h1 className="text-3xl font-playfair font-bold text-collector-black mb-6">Shipping & Delivery Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: June 1, 2025</p>

          <div className="space-y-6 text-gray-800">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">1. Digital Service Delivery</h2>
              <p className="mb-3">Vittas is a digital financial management platform. All services are delivered electronically:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Instant access upon successful subscription activation</li>
                <li>No physical products or shipping required</li>
                <li>Services are accessible 24/7 through our web platform</li>
                <li>Account activation is immediate upon payment confirmation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">2. Service Activation</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Free accounts are activated immediately upon registration</li>
                <li>Premium subscriptions are activated within minutes of payment</li>
                <li>You will receive email confirmation upon successful activation</li>
                <li>Login credentials are provided via secure email delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">3. Data Export and Delivery</h2>
              <p className="mb-3">For data portability and backup purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Data exports are generated instantly upon request</li>
                <li>Export files are delivered via secure download links</li>
                <li>Download links remain active for 48 hours</li>
                <li>Multiple export formats available (CSV, PDF, JSON)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">4. Service Availability</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>99.9% uptime guarantee</li>
                <li>Scheduled maintenance windows are announced 24 hours in advance</li>
                <li>Service status updates available at status.vittas.app</li>
                <li>Mobile-responsive design for access from any device</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">5. Account Setup Assistance</h2>
              <p className="mb-3">We provide comprehensive onboarding support:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Welcome email with getting started guide</li>
                <li>Interactive tutorials and product tours</li>
                <li>Email support for setup questions</li>
                <li>Knowledge base with step-by-step instructions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">6. Technical Requirements</h2>
              <p className="mb-3">To ensure optimal service delivery:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Stable internet connection</li>
                <li>JavaScript enabled</li>
                <li>Cookies enabled for authentication</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">7. Support and Delivery Issues</h2>
              <p className="mb-3">If you experience any issues with service delivery:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Check your email spam folder for activation messages</li>
                <li>Verify your internet connection and browser compatibility</li>
                <li>Contact support immediately for assistance</li>
                <li>We guarantee response within 2 hours during business hours</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 text-collector-black">8. Contact Information</h2>
              <p>For delivery or access issues, contact us at:</p>
              <div className="mt-2">
                <p>Email: support@vittas.app</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Live Chat: Available on our website</p>
                <p>Business Hours: Monday-Friday, 9 AM - 6 PM PST</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShippingDelivery;
