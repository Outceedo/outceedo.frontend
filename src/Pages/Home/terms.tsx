import OutceedoFooter from "./Footer";
import Navbar from "./Navbar";

function Terms() {
  return (
    <div>
      <Navbar />
      <section className="bg-white min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-red-600 mb-6 text-center mt-6">
            Terms of Use
          </h1>
          <div className="bg-[#f7fafb] rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Outceedo
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              Please read these Terms of Use (“Terms”) carefully before using
              outceedo.com and its services. These Terms apply to your access
              to, and use of the website and other online products and services
              (collectively, our “Services”) provided by Outceedo Ltd.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              By accessing or using our Website, Mobile App or Services, you
              agree to comply with and be legally bound by these Terms. If you
              do not read, fully understand and agree to these Terms, you must
              immediately leave the Website and discontinue use of our Services.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Who We Are
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Outceedo is an Online Marketplace (b2c eCommerce website)
              connecting worldwide sports experts and aspiring sports players.
            </p>
            <p className="text-gray-700 text-base">
              Outceedo.com is registered in Scotland, United Kingdom
              (Registration number SC853014), with the registered address at:{" "}
              <span className="font-semibold">
                82 Berryden Gardens, Aberdeen, United Kingdom, AB25 3RW
              </span>
              .
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Our Platform & Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                Sports Experts: Create profiles, showcase achievements, and
                offer services to players.
              </li>
              <li>
                Sports Players: Book services, apply for sponsorships, and
                connect with worldwide experts.
              </li>
              <li>Sports Teams: Advertise teams and apply for sponsorships.</li>
              <li>
                Sports Sponsors: Support teams and players, manage sponsorship
                applications.
              </li>
              <li>
                Audience/Fans/Followers: View, rate, like, share, and review
                experts and players.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              User Eligibility
            </h2>
            <p className="text-gray-700 text-base">
              Our Services are available only to individuals and companies that
              can form legally binding contracts under applicable law. The
              Website, app and Services are intended solely for users 18 years
              of age or older. For minors, parents or legal guardians must
              create and manage accounts on their behalf.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Users’ Obligations
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-700 mb-2">You Should:</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-base">
                  <li>Be aged 18 years or older</li>
                  <li>
                    Register your account with complete and accurate details
                  </li>
                  <li>Maintain confidentiality of login credentials</li>
                  <li>Pay applicable subscription fees and taxes</li>
                  <li>
                    Provide ownership of intellectual property used on the
                    platform
                  </li>
                  <li>Comply with all relevant policies and guidelines</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-2">
                  You Should Not:
                </h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 text-base">
                  <li>
                    Use the platform if under 18 (unless managed by
                    parent/guardian)
                  </li>
                  <li>
                    Upload false, offensive, illegal, or infringing content
                  </li>
                  <li>Interfere with other user accounts</li>
                  <li>Transfer account details without consent</li>
                  <li>Distribute viruses or harmful technologies</li>
                  <li>Fail to pay for services</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Confidentiality & Privacy
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Keep your User ID and Password confidential</li>
              <li>
                Update registration and profile information to remain accurate
              </li>
              <li>
                Review our{" "}
                <span className="font-semibold">Privacy & Cookie Policy</span>{" "}
                for details on how we handle your data
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Intellectual Property
            </h2>
            <p className="text-gray-700 text-base mb-2">
              All content on outceedo.com is governed by intellectual property
              laws and may not be reproduced without written approval. By
              uploading content, you grant us a worldwide, perpetual license to
              use and promote it, provided you have appropriate rights.
            </p>
            <p className="text-gray-700 text-base">
              Content owners may contact us at{" "}
              <a
                href="mailto:info@outceedo.com"
                className="text-red-500 hover:underline"
              >
                info@outceedo.com
              </a>{" "}
              to request removal of unauthorized material.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              User Profiles & Accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                Only authorized individuals may register under each user
                category
              </li>
              <li>Provide true, accurate, and complete information</li>
              <li>Accounts may be ceased for policy or legal violations</li>
              <li>
                For minors, only parents/guardians may create and manage
                accounts
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Payments, Cancellations, and Refunds
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Payments for services must be made using supported payment methods
              (Stripe, PayPal, Debit/Credit Cards). Transaction fees may apply.
              Cancellations must be made within 72 hours; otherwise, a
              cancellation fee applies. Refunds are processed within 15 working
              days.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Accuracy, Ratings & Reviews
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Outceedo relies on users for accurate information. Ratings and
              reviews are for informational and research purposes only, not
              endorsements.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Outceedo Ltd is not responsible for losses caused by business
              decisions, ratings, content, non-availability of experts, delays,
              bugs, viruses, force majeure, or indirect damages. All use of the
              platform is at your own risk.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Indemnity
            </h2>
            <p className="text-gray-700 text-base mb-2">
              You agree to indemnify and hold Outceedo Ltd and its affiliates
              harmless from any claims, losses, damages, liabilities, costs, and
              expenses arising from your use of the platform or any breach of
              these Terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Dispute Resolution
            </h2>
            <p className="text-gray-700 text-base mb-2">
              Any disputes arising from these Terms shall be resolved by
              mediation and/or arbitration under the London Court of
              International Arbitration (LCIA) Rules, with the seat of
              arbitration in London, United Kingdom, and conducted in English.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Termination
            </h2>
            <p className="text-gray-700 text-base mb-2">
              You may cancel your account at any time by emailing{" "}
              <a
                href="mailto:info@outceedo.com"
                className="text-red-500 hover:underline"
              >
                info@outceedo.com
              </a>
              . Outceedo reserves the right to terminate accounts and refuse
              service for breach of these Terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Changes to Terms of Use
            </h2>
            <p className="text-gray-700 text-base mb-2">
              We reserve the right to update these Terms at any time. Your
              continued use of Outceedo.com after any changes constitutes
              acceptance of the new Terms.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Contact Us
            </h2>
            <p className="text-gray-700 text-base mb-1">
              Outceedo Limited
              <br />
              82 Berryden Gardens, Aberdeen, United Kingdom, AB25 3RW
              <br />
              Registration No. SC853014
              <br />
              Web:{" "}
              <a
                href="https://outceedo.com"
                className="text-red-500 hover:underline"
              >
                outceedo.com
              </a>
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
              Thank you for using Outceedo!
            </span>
          </div>
        </div>
      </section>
      <OutceedoFooter />
    </div>
  );
}

export default Terms;
