import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-600 mb-6 text-center mt-6">
            Privacy & Cookie Policy
          </h1>
          <div className="bg-[#f7fafb] rounded-xl shadow-md p-8 mb-8">
            <p className="text-lg text-gray-800 mb-4">
              Outceedo Limited (
              <a
                href="https://outceedo.com"
                className="text-red-500 hover:underline"
              >
                outceedo.com
              </a>
              ), registered in Scotland, UK (Registration number SC853014), with
              address: 82 Berryden Gardens, Aberdeen, UK, AB25 3RW, complies
              with UK data protection laws and takes reasonable care to prevent
              unauthorised access to your personal data.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              By using our website and services you give us permission to use
              your data as set out in this Privacy Policy. If you do not agree,
              please refrain from using our website or services.
            </p>
            <p className="text-lg text-gray-800 mb-4">
              This policy (together with our{" "}
              <Link to="/terms" className="text-red-500 hover:underline">
                Terms of Use
              </Link>
              ) sets out the basis on which any personal data we collect from
              you, or that you provide to us, will be processed by us. Please
              read it carefully.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <span className="font-semibold">Information you give us:</span>{" "}
                By registration, orders, correspondence, surveys, competitions,
                etc. Includes name, address, email, phone, payment info, profile
                photo, and other personal details.
              </li>
              <li>
                <span className="font-semibold">
                  Information we collect automatically:
                </span>{" "}
                Includes IP address, login info, browser type, location, time
                zone, pages visited, clickstream, interaction info, device info,
                and error logs.
              </li>
              <li>
                <span className="font-semibold">
                  Information from other sources:
                </span>{" "}
                Includes data from partner sites, business partners, payment
                processors, analytics providers, social media interactions, and
                more.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Cookies & Similar Technologies
            </h2>
            <p className="text-gray-700 text-base mb-2">
              We use cookies to recognise your device, remember preferences,
              verify users, and perform security checks. Cookies may be session,
              persistent, first-party, or third-party. You can disable cookies
              in your browser settings.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <span className="font-semibold">Cookies:</span> Small text files
                stored on your device.
              </li>
              <li>
                <span className="font-semibold">Web beacons:</span> Pixel
                tags/clear GIFs to identify users and behaviour.
              </li>
              <li>
                <span className="font-semibold">Similar technologies:</span>{" "}
                Like HTML5 or flash cookies, local storage.
              </li>
            </ul>
            <p className="text-gray-700 text-base">
              We may refer to all these as "cookies" in our policies.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                To fulfil contracts and provide requested services/products
              </li>
              <li>To inform you about related services, updates, or changes</li>
              <li>For marketing (with your consent, opt-out available)</li>
              <li>To administer and improve our site and services</li>
              <li>For troubleshooting, analytics, research, and security</li>
              <li>To personalise content and recommendations</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Disclosure of Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Within the Outceedo group of companies</li>
              <li>
                To business partners, suppliers, advertisers, analytics/search
                providers, and credit agencies
              </li>
              <li>
                In business transfers, mergers, legal obligations, fraud
                protection, or risk reduction
              </li>
              <li>
                If required by law or to protect Outceedo, its users, or others
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Where We Store Your Personal Data
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Data may be transferred, stored, and processed outside the
              European Economic Area (EEA). We take reasonable measures to
              ensure your data is secure. Payment transactions are encrypted
              using SSL technology. You are responsible for keeping your
              password confidential.
            </p>
            <p className="text-gray-700 text-base">
              Transmission via the internet is not completely secure; any
              transmission is at your own risk.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Your Rights
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>You can opt out of marketing communications at any time</li>
              <li>
                Contact us to access, correct, or request deletion of your data
              </li>
              <li>
                Our site may contain links to partners, advertisers, or
                affiliates; please review their privacy policies before
                submitting data
              </li>
              <li>Access requests may incur a £10 fee for premium users</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Confidentiality
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Keep your User ID and Password confidential</li>
              <li>
                Do not let others access your account or use false information
              </li>
              <li>
                Update your registration information to remain true and complete
              </li>
              <li>
                Conduct yourself professionally in all interactions on Outceedo
              </li>
              <li>Use of the website is at your sole risk</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Changes to Our Privacy Policy
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Any changes will be posted on this page and, where appropriate,
              notified by email. Please check back regularly for updates.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Contact</h2>
            <p className="text-gray-700 text-base mb-1">
              Questions, comments and requests regarding this privacy policy are
              welcomed and should be addressed to:
              <br />
              <span className="font-semibold">
                82 Berryden Gardens, Aberdeen, UK, AB25 3RW
              </span>
              <br />
              Email:{" "}
              <a
                href="mailto:info@outceedo.com"
                className="text-red-500 hover:underline"
              >
                info@outceedo.com
              </a>
            </p>
          </div>

          <div className="mt-12 text-center">
            <span className="inline-block bg-red-100 text-red-600 px-6 py-3 rounded-full text-lg font-semibold shadow">
              Thank you for trusting Outceedo with your privacy.
            </span>
          </div>
        </div>
      </section>
      <OutceedoFooter />
    </div>
  );
}

export default Privacy;
